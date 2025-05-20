import { Injectable, Logger } from '@nestjs/common';

import { TargetContentType } from '@/prisma/generated';
import { PrismaService } from '@/src/core/prisma/prisma.service';
import { RedisService } from '@/src/core/redis/redis.service';
import { PaginationInput } from '@/src/shared/inputs/pagination.input';

import { CreateCommentInput, UpdateCommentInput } from './inputs/comment.input';

@Injectable()
export class CommentService {
	private readonly logger = new Logger(CommentService.name);
	private readonly cacheKeyPrefix = 'comment:';

	constructor(
		private readonly prisma: PrismaService,
		private readonly redis: RedisService
	) {}

	async createComment(authorId: string, input: CreateCommentInput) {
		const comment = await this.prisma.comment.create({
			data: {
				content: input.content,
				authorId,
				targetContentType: input.targetContentType,
				targetId: input.targetId,
				parentId: input.parentId
			},
			include: {
				author: true,
				replies: true
			}
		});

		await this.invalidateCommentCache(input.targetId, input.targetContentType);
		return comment;
	}

	async updateComment(commentId: string, input: UpdateCommentInput) {
		const comment = await this.prisma.comment.update({
			where: { id: commentId },
			data: { content: input.content },
			include: {
				author: true,
				replies: true
			}
		});

		await this.invalidateCommentCache(
			comment.targetId,
			comment.targetContentType
		);
		return comment;
	}

	async deleteComment(id: string) {
		const comment = await this.prisma.comment.delete({ where: { id } });
		await this.invalidateCommentCache(
			comment.targetId,
			comment.targetContentType
		);
		return true;
	}

	async getCommentsByTarget(
		targetContentType: TargetContentType,
		targetId: string,
		pagination: PaginationInput
	) {
		const { take, skip, searchTerm } = pagination;

		try {
			const [comments, total] = await Promise.all([
				this.prisma.comment.findMany({
					where: {
						targetContentType,
						targetId,
						parentId: null
					},
					skip,
					take,
					orderBy: { createdAt: 'desc' },
					include: {
						author: true,
						replies: {
							include: {
								author: true
							},
							orderBy: { createdAt: 'asc' }
						}
					}
				}),
				this.prisma.comment.count({
					where: {
						targetContentType,
						targetId,
						parentId: null
					}
				})
			]);

			const result = {
				data: comments,
				total
			};

			return result;
		} catch (error) {
			this.logger.error(`Ошибка при получении комментариев: ${error.message}`);
			throw error;
		}
	}

	async getCommentReplies(parentId: string, pagination: PaginationInput) {
		const { take, skip, searchTerm } = pagination;

		try {
			const [replies, total] = await Promise.all([
				this.prisma.comment.findMany({
					where: { parentId },
					skip,
					take,
					orderBy: { createdAt: 'asc' },
					include: {
						author: true
					}
				}),
				this.prisma.comment.count({
					where: { parentId }
				})
			]);

			const result = {
				data: replies,
				total
			};

			return result;
		} catch (error) {
			this.logger.error(
				`Ошибка получения ответов на комментарий: ${error.message}`
			);
			throw error;
		}
	}

	private async invalidateCommentCache(
		targetId: string,
		targetContentType: TargetContentType
	) {
		const keys = await this.redis.keys(
			`${this.cacheKeyPrefix}${targetContentType}:${targetId}:*`
		);
		if (keys.length > 0) {
			await this.redis.del(...keys);
		}

		const replyKeys = await this.redis.keys(`${this.cacheKeyPrefix}replies:*`);
		if (replyKeys.length > 0) {
			await this.redis.del(...replyKeys);
		}
	}
}
