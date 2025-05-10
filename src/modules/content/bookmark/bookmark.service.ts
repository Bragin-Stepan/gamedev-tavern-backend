import { Injectable, Logger } from '@nestjs/common';
import { TargetContentType } from '@prisma/generated';

import { PrismaService } from '@/src/core/prisma/prisma.service';
import { RedisService } from '@/src/core/redis/redis.service';

import { BookmarkInput } from './inputs/bookmark.input';
import { BookmarkModel } from './models/bookmark.model';

@Injectable()
export class BookmarkService {
	private readonly logger = new Logger(BookmarkService.name);
	private readonly cacheKeyPrefix = 'bookmark:';

	constructor(
		private readonly prismaService: PrismaService,
		private readonly redis: RedisService
	) {}

	async toggleBookmark(userId: string, input: BookmarkInput): Promise<boolean> {
		const { targetContentType, targetId } = input;
		await this.verifyContentExists(targetContentType, targetId);

		const existingBookmark = await this.prismaService.bookmark.findUnique({
			where: {
				userId_targetContentType_targetId: {
					userId,
					targetContentType: targetContentType,
					targetId: targetId
				}
			}
		});

		if (existingBookmark) {
			await this.prismaService.bookmark.delete({
				where: {
					userId_targetContentType_targetId: {
						userId,
						targetContentType: targetContentType,
						targetId: targetId
					}
				}
			});

			await this.updateTargetBookmarkStatus(targetContentType, targetId, false);
			await this.invalidateCache(userId, targetContentType, targetId);

			return false;
		} else {
			await this.prismaService.bookmark.create({
				data: {
					userId,
					targetContentType: targetContentType,
					targetId: targetId
				}
			});

			await this.updateTargetBookmarkStatus(targetContentType, targetId, true);
			await this.invalidateCache(userId, targetContentType, targetId);

			return true;
		}
	}

	async findMyBookmarks(userId: string) {
		const cacheKey = `${this.cacheKeyPrefix}user:${userId}`;

		try {
			const cached = await this.redis.get(cacheKey);
			if (cached) {
				return JSON.parse(cached);
			}

			const bookmarks = await this.prismaService.bookmark.findMany({
				where: { userId },
				orderBy: { createdAt: 'desc' },
				include: {
					user: true,
					topic: true,
					project: true
				}
			});

			await this.redis.set(cacheKey, JSON.stringify(bookmarks), 'EX', 3600);
			return bookmarks;
		} catch (error) {
			this.logger.error(
				`Ошибка получения избранных по пользователю: ${error.message}`
			);
			throw error;
		}
	}

	private async verifyContentExists(
		targetContentType: TargetContentType,
		targetId: string
	): Promise<void> {
		switch (targetContentType) {
			case TargetContentType.PROJECT:
				await this.prismaService.project.findUniqueOrThrow({
					where: { id: targetId }
				});
				break;
			case TargetContentType.TOPIC:
				await this.prismaService.topic.findUniqueOrThrow({
					where: { id: targetId }
				});
				break;
			default:
				throw new Error(
					'Невозможно добавить в закладки несуществующий контент'
				);
		}
	}

	private async updateTargetBookmarkStatus(
		targetContentType: TargetContentType,
		targetId: string,
		isBookmarked: boolean
	): Promise<void> {
		switch (targetContentType) {
			case TargetContentType.PROJECT:
				await this.prismaService.project.update({
					where: { id: targetId },
					data: { isBookmarked }
				});
				break;
			case TargetContentType.TOPIC:
				await this.prismaService.topic.update({
					where: { id: targetId },
					data: { isBookmarked }
				});
				break;
			default:
				break;
		}
	}

	private async invalidateCache(
		userId: string,
		targetContentType?: TargetContentType,
		targetId?: string
	): Promise<void> {
		await this.redis.del(`${this.cacheKeyPrefix}user:${userId}`);

		if (targetContentType && targetId) {
			await this.redis.del(
				`${this.cacheKeyPrefix}check:${userId}:${targetContentType}:${targetId}`
			);
		}
	}
}
