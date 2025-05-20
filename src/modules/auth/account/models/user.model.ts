import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

import type { RoleType, User } from '@/prisma/generated';
import { BookmarkModel } from '@/src/modules/content/bookmark/models/bookmark.model';
import { CommentModel } from '@/src/modules/content/comment/models/comment.model';
import { ProjectModel } from '@/src/modules/content/project/models/project.model';
import { TopicModel } from '@/src/modules/content/topic/models/topic.model';
import { ViewModel } from '@/src/modules/libs/view/models/view.model';
import { CandidateCardModel } from '@/src/modules/user/candidate-card/models/candidate-card.model';
import { FollowModel } from '@/src/modules/user/follow/models/follow.model';
import { SpecializationModel } from '@/src/modules/user/specialization/models/specialization.model';
import { LinkModel } from '@/src/shared/models/link.model';

@ObjectType()
export class UserModel implements User {
	@Field(() => ID)
	public id: string;

	@Field(() => Int)
	public uid: number;

	@Field(() => String)
	public email: string;

	@Field(() => String)
	public password: string;

	@Field(() => String)
	public role: RoleType;

	@Field(() => String, { nullable: true })
	public username: string;

	@Field(() => String, { nullable: true })
	public city: string;

	@Field(() => String, { nullable: true })
	public iconSpecialization: string;

	@Field(() => String, { nullable: true })
	public status: string;

	@Field(() => String, { nullable: true })
	public avatar: string;

	@Field(() => Boolean)
	public isLookingTeam: boolean;

	@Field(() => Boolean)
	public isGatheringTeam: boolean;

	@Field(() => CandidateCardModel, { nullable: true })
	public candidateCard: CandidateCardModel;

	@Field(() => [ProjectModel])
	public projects: ProjectModel[];

	@Field(() => [TopicModel])
	public topics: TopicModel[];

	@Field(() => [CommentModel])
	public comments: CommentModel[];

	@Field(() => [BookmarkModel])
	public bookmarks: BookmarkModel[];

	@Field(() => [ViewModel])
	public views: ViewModel[];

	@Field(() => SpecializationModel, { nullable: true })
	public specialization: SpecializationModel;

	@Field(() => String)
	public specializationId: string;

	@Field(() => [LinkModel])
	public socialLinks: LinkModel[];

	@Field(() => [FollowModel])
	public followers: FollowModel[];

	@Field(() => [FollowModel])
	public followings: FollowModel[];

	@Field(() => Boolean)
	public isVerified: boolean;

	@Field(() => Boolean)
	public isEmailVerified: boolean;

	@Field(() => Boolean)
	public isDeactivated: boolean;

	@Field(() => Date, { nullable: true })
	public deactivatedAt: Date;

	@Field(() => Date)
	public createdAt: Date;

	@Field(() => Date)
	public updatedAt: Date;
}
