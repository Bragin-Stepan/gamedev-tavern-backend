import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';

import { Topic } from '@/prisma/generated';
import { UserModel } from '@/src/modules/auth/account/models/user.model';
import { Pagination } from '@/src/shared/models/pagination.model';

import { BookmarkModel } from '../../bookmark/models/bookmark.model';
import { SubcategoryModel } from '../../subcategory/models/subcategory.model';

@ObjectType()
export class TopicModel implements Topic {
	@Field(() => ID)
	id: string;

	@Field()
	title: string;

	@Field(() => GraphQLJSON)
	contentBlocks: Record<string, any> | null;

	@Field()
	slug: string;

	@Field(() => Int)
	viewCount: number;

	@Field(() => ID)
	authorId: string;

	@Field(() => ID)
	attachedProjectId: string | null;

	@Field(() => ID)
	subcategoryId: string;

	@Field(() => [UserModel])
	bookmarks: BookmarkModel;

	@Field()
	isBookmarked: boolean;

	// @Field(() => [CommentModel])
	// comments: CommentModel[];

	// @Field(() => ProjectModel, { nullable: true })
	// attachedProject?: ProjectModel;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;
}

@ObjectType()
export class PaginatedTopics {
	@Field(() => [TopicModel])
	data: TopicModel[];

	@Field(() => Pagination)
	pagination: Pagination;
}
