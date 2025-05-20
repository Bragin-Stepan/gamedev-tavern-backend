import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, TargetContentType, User } from '@prisma/generated';
import type { Request } from 'express';

import { PrismaService } from '@/src/core/prisma/prisma.service';
import { RedisService } from '@/src/core/redis/redis.service';
import { PaginationInput } from '@/src/shared/inputs/pagination.input';
import { generateSlug } from '@/src/shared/utils/generate-slug.util';

import { ViewService } from '../../libs/view/view.service';

import { CreateTopicInput, UpdateTopicInput } from './inputs/topic.input';

@Injectable()
export class TopicService {
	private readonly logger = new Logger(TopicService.name);
	private readonly cacheKeyPrefix = 'topic:';

	constructor(
		private readonly prisma: PrismaService,
		private readonly redis: RedisService,
		private readonly viewService: ViewService
	) {}

	public async findAllTopics(
		categoryId?: string,
		subcategoryId?: string,
		pagination?: PaginationInput
	) {
		const { take, skip, searchTerm } = pagination;

		const where: Prisma.TopicWhereInput = {};

		if (subcategoryId) {
			where.subcategoryId = subcategoryId;
		} else if (categoryId) {
			where.subcategory = {
				categoryId
			};
		}

		const topics = await this.prisma.topic.findMany({
			where,
			take: take ?? 12,
			skip: skip ?? 0,
			orderBy: { createdAt: 'desc' },
			include: {
				author: {
					include: {
						socialLinks: true
					}
				},
				comments: true,
				subcategory: {
					include: { category: true }
				},
				_count: {
					select: { comments: true }
				}
			}
		});

		return topics;
	}

	public async createTopic(user: User, input: CreateTopicInput) {
		const { subcategoryId, attachedProjectId, title, contentBlocks } = input;

		const slug = generateSlug(title);

		await this.prisma.topic.create({
			data: {
				title,
				slug,
				contentBlocks,
				author: {
					connect: { id: user.id }
				},
				subcategory: {
					connect: { id: subcategoryId }
				},
				attachedProject: attachedProjectId
					? { connect: { id: attachedProjectId } }
					: undefined,
				isBookmarked: false,
				viewCount: 0
			}
		});

		return true;
	}

	public async updateTopic(id: string, input: UpdateTopicInput) {
		const data: any = { ...input };

		if (input.title) {
			data.slug = generateSlug(input.title);
		}

		const topic = await this.prisma.topic.update({
			where: { id },
			data
		});

		return true;
	}

	public async deleteTopic(id: string) {
		await this.prisma.topic.delete({ where: { id } });

		return true;
	}

	public async findTopicById(
		id: string,
		user: User | null,
		req: Request,
		userAgent: string
	) {
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
							author: true
						}
					},
					attachedProject: true
				}
			});
			if (!topic) throw new NotFoundException('Тема не найдена');

			await this.redis.set(cacheKey, JSON.stringify(topic), 'EX', 3600);

			await this.viewService.trackView(
				user.id,
				TargetContentType.TOPIC,
				id,
				req,
				userAgent
			);

			return topic;
		} catch (error) {
			this.logger.error(`Ошибка при поиске темы: ${error.message}`);
			throw error;
		}
	}

	async topicsByAuthor(authorId: string, pagination?: PaginationInput) {
		const { take, skip, searchTerm } = pagination;

		const topics = await this.prisma.topic.findMany({
			where: { authorId: authorId },
			orderBy: { createdAt: 'desc' },
			take,
			skip,
			include: {
				author: true,
				subcategory: {
					include: { category: true }
				}
			}
		});
	}
}
