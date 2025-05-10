import { Field, ObjectType } from '@nestjs/graphql';

import { Bookmark, TargetContentType } from '@/prisma/generated';
import { UserModel } from '@/src/modules/auth/account/models/user.model';

import { TopicModel } from '../../topic/models/topic.model';

@ObjectType()
export class BookmarkModel implements Bookmark {
	@Field(() => String)
	id: string;

	@Field(() => UserModel)
	user: UserModel;

	@Field(() => String)
	userId: string;

	@Field(() => TargetContentType)
	targetContentType: TargetContentType;

	@Field(() => String)
	targetId: string;

	// @Field(() => ProjectModel, { nullable: true })
	// project: ProjectModel;

	// @Field(() => TopicModel, { nullable: true })
	// topic: TopicModel;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}
