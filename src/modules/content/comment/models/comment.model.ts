import { Field, ID, ObjectType } from '@nestjs/graphql';

import { TargetContentType } from '@/prisma/generated';
import { UserModel } from '@/src/modules/auth/account/models/user.model';

@ObjectType()
export class CommentModel {
	@Field(() => ID)
	id: string;

	@Field()
	content: string;

	@Field(() => UserModel)
	author: UserModel;

	@Field(() => [CommentModel], { nullable: true })
	replies?: CommentModel[];

	@Field(() => TargetContentType)
	targetContentType: TargetContentType;

	@Field(() => ID)
	targetId: string;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;
}

@ObjectType()
export class PaginatedComments {
	@Field(() => [CommentModel])
	data: CommentModel[];

	@Field(() => Number)
	total: number;

	@Field(() => Number)
	page: number;

	@Field(() => Number)
	limit: number;
}
