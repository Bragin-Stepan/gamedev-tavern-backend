import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { TargetContentType, User } from '@/prisma/generated';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { Authorized } from '@/src/shared/decorators/authorized.decorator';
import { PaginationInput } from '@/src/shared/inputs/pagination.input';

import { CommentService } from './comment.service';
import { CreateCommentInput, UpdateCommentInput } from './inputs/comment.input';
import { CommentModel, PaginatedComments } from './models/comment.model';

@Resolver('Comment')
export class CommentResolver {
	constructor(private readonly commentService: CommentService) {}

	@Authorization()
	@Mutation(() => CommentModel, { name: 'createComment' })
	async createComment(
		@Args('data') input: CreateCommentInput,
		@Authorized() user: User
	) {
		return this.commentService.createComment(user.id, input);
	}

	@Authorization()
	@Mutation(() => CommentModel, { name: 'updateComment' })
	async updateComment(
		@Args('commentId') commentId: string,
		@Args('data') input: UpdateCommentInput
	) {
		return this.commentService.updateComment(commentId, input);
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'deleteComment' })
	async deleteComment(@Args('id') id: string) {
		return this.commentService.deleteComment(id);
	}

	@Query(() => PaginatedComments, { name: 'findAllCommentsByTarget' })
	async comments(
		@Args('targetContentType') targetContentType: TargetContentType,
		@Args('targetId') targetId: string,
		@Args('pagination') pagination: PaginationInput
	) {
		return this.commentService.getCommentsByTarget(
			targetContentType,
			targetId,
			pagination
		);
	}

	@Query(() => PaginatedComments, { name: 'findAllCommentReplies' })
	async commentReplies(
		@Args('parentId') parentId: string,
		@Args('pagination') pagination: PaginationInput
	) {
		return this.commentService.getCommentReplies(parentId, pagination);
	}
}
