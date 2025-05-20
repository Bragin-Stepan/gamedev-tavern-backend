import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';

import { Topic } from '@/prisma/generated';
import { UserModel } from '@/src/modules/auth/account/models/user.model';

import { BookmarkModel } from '../../bookmark/models/bookmark.model';
import { CommentModel } from '../../comment/models/comment.model';
import { ProjectModel } from '../../project/models/project.model';
import { SubcategoryModel } from '../../subcategory/models/subcategory.model';

@ObjectType()
export class TopicModel implements Topic {
	@Field(() => ID)
	public id: string;

	@Field()
	public title: string;

	@Field(() => GraphQLJSON)
	public contentBlocks: Record<string, any> | null;

	@Field()
	public slug: string;

	@Field(() => Number)
	public viewCount: number;

	@Field(() => UserModel)
	public author: UserModel;

	@Field(() => String)
	public authorId: string;

	@Field(() => SubcategoryModel)
	public subcategory: SubcategoryModel;

	@Field(() => String)
	public subcategoryId: string;

	@Field(() => [BookmarkModel])
	public bookmarks: BookmarkModel;

	@Field()
	public isBookmarked: boolean;

	@Field(() => [CommentModel])
	public comments: CommentModel[];

	@Field(() => ProjectModel, { nullable: true })
	public attachedProject?: ProjectModel;

	@Field(() => String, { nullable: true })
	public attachedProjectId: string | null;

	@Field()
	public createdAt: Date;

	@Field()
	public updatedAt: Date;
}
