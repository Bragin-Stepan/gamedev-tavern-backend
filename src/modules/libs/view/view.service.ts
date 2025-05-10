import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { Request } from 'express';

import { TargetContentType } from '@/prisma/generated';
import { PrismaService } from '@/src/core/prisma/prisma.service';
import { RedisService } from '@/src/core/redis/redis.service';
import { getSessionMetadata } from '@/src/shared/utils/session-metadata.util';

import { ViewInput } from './inputs/view.input';
import { ViewModel } from './models/view.model';

@Injectable()
export class ViewService {
	private readonly logger = new Logger(ViewService.name);
	private readonly cacheKeyPrefix = 'view:';
	private readonly ipCachePrefix = 'view:ip:';

	constructor(
		private readonly prisma: PrismaService,
		private readonly redis: RedisService
	) {}

	async trackView(
		viewerId: string | null,
		input: ViewInput,
		req: Request,
		userAgent: string
	): Promise<boolean> {
		const { targetContentType, targetId } = input;
		await this.verifyContentExists(targetContentType, targetId);

		const metadata = getSessionMetadata(req, userAgent);
		const ipCacheKey = `${this.ipCachePrefix}${targetContentType}:${targetId}:${metadata.ip}`;

		const hasViewed = await this.hasViewedFromIp(
			targetContentType,
			targetId,
			metadata.ip
		);

		if (hasViewed) {
			await this.updateLastViewTime(targetContentType, targetId, metadata.ip);
			return false;
		}

		await this.createViewRecord(
			viewerId,
			targetContentType,
			targetId,
			metadata.ip
		);

		await this.redis.set(ipCacheKey, '1', 'EX', 86400);

		await this.incrementViewCount(targetContentType, targetId);
		await this.invalidateCache(targetContentType, targetId);

		return true;
	}

	async getViewCount(
		targetContentType: TargetContentType,
		targetId: string
	): Promise<number> {
		const cacheKey = `${this.cacheKeyPrefix}count:${targetContentType}:${targetId}`;

		try {
			const cached = await this.redis.get(cacheKey);
			if (cached) return parseInt(cached, 10);

			const uniqueViews = await this.prisma.view.groupBy({
				by: ['ip'],
				where: {
					targetContentType,
					targetId
				}
			});

			const count = uniqueViews.length;
			await this.redis.set(cacheKey, count.toString(), 'EX', 300);
			return count;
		} catch (error) {
			this.logger.error(
				`Ошибка при получении количества просмотров: ${error.message}`
			);
			throw error;
		}
	}

	async getRecentViews(
		targetContentType: TargetContentType,
		targetId: string,
		limit = 10
	): Promise<ViewModel[]> {
		const cacheKey = `${this.cacheKeyPrefix}recent:${targetContentType}:${targetId}:${limit}`;

		try {
			const cached = await this.redis.get(cacheKey);
			if (cached) return JSON.parse(cached);

			const views = await this.prisma.view.findMany({
				where: { targetContentType, targetId },
				orderBy: { updatedAt: 'desc' },
				take: limit,
				distinct: ['ip']
			});

			await this.redis.set(cacheKey, JSON.stringify(views), 'EX', 300);
			return views;
		} catch (error) {
			this.logger.error(
				`Ошибка при получении последних просмотров: ${error.message}`
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
				await this.prisma.project.findUniqueOrThrow({
					where: { id: targetId }
				});
				break;
			case TargetContentType.TOPIC:
				await this.prisma.topic.findUniqueOrThrow({
					where: { id: targetId }
				});
				break;
			case TargetContentType.CANDIDATE_CARD:
				await this.prisma.candidateCard.findUniqueOrThrow({
					where: { id: targetId }
				});
				break;
			default:
				throw new NotFoundException('Невалидный тип контента для просмотра');
		}
	}

	private async incrementViewCount(
		targetContentType: TargetContentType,
		targetId: string
	): Promise<void> {
		switch (targetContentType) {
			case TargetContentType.PROJECT:
				await this.prisma.project.update({
					where: { id: targetId },
					data: {
						viewCount: {
							increment: 1
						}
					}
				});
				break;
			case TargetContentType.TOPIC:
				await this.prisma.topic.update({
					where: { id: targetId },
					data: {
						viewCount: {
							increment: 1
						}
					}
				});
				break;
			default:
				break;
		}
	}

	private async invalidateCache(
		targetContentType: TargetContentType,
		targetId: string
	): Promise<void> {
		await this.redis.del(
			`${this.cacheKeyPrefix}count:${targetContentType}:${targetId}`
		);

		const keys = await this.redis.keys(
			`${this.cacheKeyPrefix}recent:${targetContentType}:${targetId}:*`
		);
		if (keys.length > 0) {
			await this.redis.del(...keys);
		}
	}

	private async hasViewedFromIp(
		targetContentType: TargetContentType,
		targetId: string,
		ip: string
	): Promise<boolean> {
		const ipCacheKey = `${this.ipCachePrefix}${targetContentType}:${targetId}:${ip}`;

		const cachedView = await this.redis.get(ipCacheKey);
		if (cachedView) return true;

		const viewCount = await this.prisma.view.count({
			where: {
				targetContentType,
				targetId,
				ip
			}
		});

		if (viewCount > 0) {
			await this.redis.set(ipCacheKey, '1', 'EX', 86400);
			return true;
		}

		return false;
	}

	private async updateLastViewTime(
		targetContentType: TargetContentType,
		targetId: string,
		ip: string
	): Promise<void> {
		await this.prisma.view.updateMany({
			where: {
				targetContentType,
				targetId,
				ip
			},
			data: {
				updatedAt: new Date()
			}
		});
	}

	private async createViewRecord(
		viewerId: string | null,
		targetContentType: TargetContentType,
		targetId: string,
		ip: string
	): Promise<void> {
		await this.prisma.view.create({
			data: {
				viewerId,
				ip,
				targetContentType,
				targetId,
				updatedAt: new Date()
			}
		});
	}
}
