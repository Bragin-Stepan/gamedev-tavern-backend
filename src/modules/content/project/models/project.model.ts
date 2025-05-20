import { Field, ID, ObjectType } from '@nestjs/graphql';

import { UserModel } from '@/src/modules/auth/account/models/user.model';
import { LinkModel } from '@/src/shared/models/link.model';

import { CommentModel } from '../../comment/models/comment.model';
import { TopicModel } from '../../topic/models/topic.model';

@ObjectType()
export class ProjectModel {
	@Field(() => ID)
	id: string;

	@Field()
	title: string;

	@Field(() => [String])
	images: string[];

	@Field(() => [String])
	genres: string[];

	@Field()
	description: string;

	@Field(() => [TopicModel])
	topics: TopicModel[];

	@Field(() => [LinkModel])
	platformsLinks: LinkModel[];

	@Field(() => [CommentModel])
	comments: CommentModel[];

	@Field(() => UserModel)
	author: UserModel;

	@Field()
	isBookmarked: boolean;

	@Field()
	viewCount: number;

	@Field()
	isGathering: boolean;

	@Field()
	slug: string;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;
}

@ObjectType()
export class PaginatedProjects {
	@Field(() => [ProjectModel])
	data: ProjectModel[];

	@Field(() => Number)
	total: number;

	@Field(() => Number)
	page: number;

	@Field(() => Number)
	limit: number;
}
