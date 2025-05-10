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
		private readonly prisma: PrismaService,
		private readonly redis: RedisService
	) {}

	async toggleBookmark(userId: string, input: BookmarkInput): Promise<boolean> {
		await this.verifyContentExists(input.targetContentType, input.targetId);

		const existingBookmark = await this.prisma.bookmark.findUnique({
			where: {
				userId_targetContentType_targetId: {
					userId,
					targetContentType: input.targetContentType,
					targetId: input.targetId
				}
			}
		});

		if (existingBookmark) {
			await this.prisma.bookmark.delete({
				where: {
					userId_targetContentType_targetId: {
						userId,
						targetContentType: input.targetContentType,
						targetId: input.targetId
					}
				}
			});

			await this.updateTargetBookmarkStatus(
				input.targetContentType,
				input.targetId,
				false
			);

			await this.invalidateCache(
				userId,
				input.targetContentType,
				input.targetId
			);
			return false;
		} else {
			await this.prisma.bookmark.create({
				data: {
					userId,
					targetContentType: input.targetContentType,
					targetId: input.targetId
				}
			});

			await this.updateTargetBookmarkStatus(
				input.targetContentType,
				input.targetId,
				true
			);

			await this.invalidateCache(
				userId,
				input.targetContentType,
				input.targetId
			);
			return true;
		}
	}

	// async findByUser(userId: string): Promise<BookmarkModel[]> {
	// 	const cacheKey = `${this.cacheKeyPrefix}user:${userId}`;

	// 	try {
	// 		const cached = await this.redis.get(cacheKey);
	// 		if (cached) {
	// 			return JSON.parse(cached);
	// 		}

	// 		const bookmarks = await this.prisma.bookmark.findMany({
	// 			where: { userId },
	// 			orderBy: { createdAt: 'desc' }
	// 		});

	// 		await this.redis.set(cacheKey, JSON.stringify(bookmarks), 'EX', 3600);
	// 		return bookmarks;
	// 	} catch (error) {
	// 		this.logger.error(
	// 			`Ошибка получения избранных по пользователю: ${error.message}`
	// 		);
	// 		throw error;
	// 	}
	// }

	// async checkBookmark(
	// 	userId: string,
	// 	targetContentType: TargetContentType,
	// 	targetId: string
	// ): Promise<boolean> {
	// 	const cacheKey = `${this.cacheKeyPrefix}check:${userId}:${targetContentType}:${targetId}`;

	// 	try {
	// 		const cached = await this.redis.get(cacheKey);
	// 		if (cached) {
	// 			return JSON.parse(cached);
	// 		}

	// 		const count = await this.prisma.bookmark.count({
	// 			where: {
	// 				userId,
	// 				targetContentType,
	// 				targetId
	// 			}
	// 		});

	// 		const result = count > 0;
	// 		await this.redis.set(cacheKey, JSON.stringify(result), 'EX', 300);
	// 		return result;
	// 	} catch (error) {
	// 		this.logger.error(`Ошибка проверки избранного: ${error.message}`);
	// 		throw error;
	// 	}
	// }

	private async verifyContentExists(
		targetContentType: TargetContentType,
		targetId: string
	): Promise<void> {
		switch (targetContentType) {
			case TargetContentType.PROJECT:
				await this.prisma.project.findUniqueOrThrow({
					where: { id: targetId }
				});
				break;
			case TargetContentType.TOPIC:
				await this.prisma.topic.findUniqueOrThrow({
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
				await this.prisma.project.update({
					where: { id: targetId },
					data: { isBookmarked }
				});
				break;
			case TargetContentType.TOPIC:
				await this.prisma.topic.update({
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
