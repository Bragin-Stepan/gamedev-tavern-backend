import { Field, ID, ObjectType } from '@nestjs/graphql';

import type { RoleType, User } from '@/prisma/generated';
import { FollowModel } from '@/src/modules/follow/models/follow.model';
import { SocialLinkModel } from '@/src/modules/profile/models/social-link.model';

@ObjectType()
export class UserModel implements User {
	@Field(() => ID)
	public id: string;

	@Field(() => Number)
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
	public specializationId: SpecializationModel;

	@Field(() => [SocialLinkModel])
	public socialLinks: SocialLinkModel[];

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
