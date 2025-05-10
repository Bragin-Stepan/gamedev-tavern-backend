import { Injectable, Logger } from '@nestjs/common';
import { TargetContentType, User } from '@prisma/generated';

import { PrismaService } from '@/src/core/prisma/prisma.service';
import { RedisService } from '@/src/core/redis/redis.service';
import { PaginationInput } from '@/src/shared/inputs/pagination.input';

import { ViewService } from '../../libs/view/view.service';

import { CreateTopicInput, UpdateTopicInput } from './inputs/topic.input';
import { PaginatedTopics, TopicModel } from './models/topic.model';

@Injectable()
export class TopicService {
	private readonly logger = new Logger(TopicService.name);
	private readonly cacheKeyPrefix = 'topic:';

	constructor(
		private readonly prisma: PrismaService,
		private readonly redis: RedisService,
		private readonly viewService: ViewService
	) {}

	async createTopic(id: string, input: CreateTopicInput) {
		const { subcategoryId, attachedProjectId, title, contentBlocks } = input;

		const slug = await this.generateUniqueSlug(title);

		await this.prisma.topic.create({
			data: {
				title,
				slug,
				contentBlocks,
				authorId: id,
				subcategoryId: subcategoryId,
				attachedProjectId: attachedProjectId,
				isBookmarked: false,
				viewCount: 0
			}
		});

		await this.invalidateCategoryCache(input.subcategoryId);
		return true;
	}

	async updateTopic(id: string, input: UpdateTopicInput) {
		const data: any = { ...input };

		if (input.title) {
			data.slug = await this.generateUniqueSlug(input.title, id);
		}

		const topic = await this.prisma.topic.update({
			where: { id },
			data
		});

		await this.invalidateTopicCache(id);
		if (input.subcategoryId) {
			await this.invalidateCategoryCache(input.subcategoryId);
		}

		return true;
	}

	async deleteTopic(id: string) {
		const topic = await this.prisma.topic.delete({ where: { id } });
		await this.invalidateTopicCache(id);
		await this.invalidateCategoryCache(topic.subcategoryId);
		return true;
	}

	async findTopicById(id: string) {
		const cacheKey = `${this.cacheKeyPrefix}${id}`;

		try {
			const cached = await this.redis.get(cacheKey);
			if (cached) return JSON.parse(cached);

			const topic = await this.prisma.topic.findUnique({
				where: { id },
				include: {
					author: {
						select: {
							id: true,
							username: true,
							avatar: true,
							specialization: true
						}
					},
					subcategory: {
						include: {
							category: true
						}
					},
					comments: {
						orderBy: { createdAt: 'desc' },
						take: 5,
						include: {
							author: {
								select: {
									id: true,
									username: true,
									avatar: true
								}
							}
						}
					},
					attachedProject: {
						select: {
							id: true,
							title: true,
							slug: true
						}
					}
				}
			});

			if (!topic) throw new Error('Topic not found');

			await this.redis.set(cacheKey, JSON.stringify(topic), 'EX', 3600);
			return topic;
		} catch (error) {
			this.logger.error(`Error finding topic: ${error.message}`);
			throw error;
		}
	}

	async findTopicsBySubcategory(
		subcategoryId: string,
		pagination: PaginationInput
	) {
		const cacheKey = `${this.cacheKeyPrefix}subcategory:${subcategoryId}:${pagination.page}:${pagination.limit}`;

		try {
			const cached = await this.redis.get(cacheKey);
			if (cached) return JSON.parse(cached);

			const [topics, total] = await Promise.all([
				this.prisma.topic.findMany({
					where: { subcategoryId },
					skip: (pagination.page - 1) * pagination.limit,
					take: pagination.limit,
					orderBy: { createdAt: 'desc' },
					include: {
						author: {
							select: {
								id: true,
								username: true,
								avatar: true
							}
						},
						_count: {
							select: { comments: true }
						}
					}
				}),
				this.prisma.topic.count({ where: { subcategoryId } })
			]);

			const result = {
				data: topics,
				pagination: {
					...pagination,
					total,
					totalPages: Math.ceil(total / pagination.limit)
				}
			};

			await this.redis.set(cacheKey, JSON.stringify(result), 'EX', 300);
			return result;
		} catch (error) {
			this.logger.error(`Error finding topics: ${error.message}`);
			throw error;
		}
	}

	async findPopularTopics(limit = 10) {
		const cacheKey = `${this.cacheKeyPrefix}popular:${limit}`;

		try {
			const cached = await this.redis.get(cacheKey);
			if (cached) return JSON.parse(cached);

			const topics = await this.prisma.topic.findMany({
				take: limit,
				orderBy: [{ viewCount: 'desc' }, { createdAt: 'desc' }],
				include: {
					author: {
						select: {
							id: true,
							username: true,
							avatar: true
						}
					},
					_count: {
						select: { comments: true }
					}
				}
			});

			await this.redis.set(cacheKey, JSON.stringify(topics), 'EX', 600);
			return topics;
		} catch (error) {
			this.logger.error(`Error finding popular topics: ${error.message}`);
			throw error;
		}
	}

	async trackTopicView(topicId: string, viewerId: string | null, ip: string) {
		await this.prisma.$transaction([
			this.prisma.view.upsert({
				where: {
					viewerId_targetContentType_targetId: {
						viewerId: viewerId || '',
						targetContentType: TargetContentType.TOPIC,
						targetId: topicId
					}
				},
				create: {
					viewerId,
					ip,
					targetContentType: TargetContentType.TOPIC,
					targetId: topicId
				},
				update: {
					updatedAt: new Date()
				}
			}),
			this.prisma.topic.update({
				where: { id: topicId },
				data: { viewCount: { increment: 1 } }
			})
		]);

		await this.invalidateTopicCache(topicId);
	}

	async toggleBookmark(userId: string, topicId: string) {
		const existing = await this.prisma.bookmark.findUnique({
			where: {
				userId_targetContentType_targetId: {
					userId,
					targetContentType: TargetContentType.TOPIC,
					targetId: topicId
				}
			}
		});

		if (existing) {
			await this.prisma.$transaction([
				this.prisma.bookmark.delete({
					where: {
						userId_targetContentType_targetId: {
							userId,
							targetContentType: TargetContentType.TOPIC,
							targetId: topicId
						}
					}
				}),
				this.prisma.topic.update({
					where: { id: topicId },
					data: { isBookmarked: false }
				})
			]);
			return false;
		} else {
			await this.prisma.$transaction([
				this.prisma.bookmark.create({
					data: {
						userId,
						targetContentType: TargetContentType.TOPIC,
						targetId: topicId
					}
				}),
				this.prisma.topic.update({
					where: { id: topicId },
					data: { isBookmarked: true }
				})
			]);
			return true;
		}
	}

	private async generateUniqueSlug(title: string, excludeId?: string) {
		let slug = title
			.toLowerCase()
			.replace(/[^\w\s-]/g, '')
			.replace(/[\s_-]+/g, '-')
			.replace(/^-+|-+$/g, '');

		let existing = await this.prisma.topic.findFirst({
			where: {
				slug,
				NOT: { id: excludeId }
			}
		});

		if (existing) {
			const randomSuffix = Math.floor(Math.random() * 10000);
			slug = `${slug}-${randomSuffix}`;
		}

		return slug;
	}

	private async invalidateTopicCache(topicId: string) {
		await this.redis.del(`${this.cacheKeyPrefix}${topicId}`);
		const keys = await this.redis.keys(`${this.cacheKeyPrefix}*`);
		if (keys.length > 0) {
			await this.redis.del(...keys);
		}
	}

	private async invalidateCategoryCache(subcategoryId: string) {
		const keys = await this.redis.keys(
			`${this.cacheKeyPrefix}subcategory:${subcategoryId}:*`
		);
		if (keys.length > 0) {
			await this.redis.del(...keys);
		}
		await this.redis.del(`${this.cacheKeyPrefix}popular:*`);
	}
}
