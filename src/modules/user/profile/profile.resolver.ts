import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import * as Upload from 'graphql-upload/Upload.js';

import type { User } from '@/prisma/generated';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { Authorized } from '@/src/shared/decorators/authorized.decorator';
import { FileValidationPipe } from '@/src/shared/pipes/file-validation.pipe';

import { UserModel } from '../../auth/account/models/user.model';

import { ChangeProfileInfoInput } from './inputs/change-profile-info.input';
import { SocialLinkInput } from './inputs/social-link.input';
// import { SocialLinkModel } from './models/social-link.model';
import { ProfileService } from './profile.service';

@Resolver('Profile')
export class ProfileResolver {
	public constructor(private readonly profileService: ProfileService) {}

	@Query(() => UserModel, { name: 'findProfileByUid' })
	public async findById(@Args('uid') uid: number) {
		return this.profileService.findByUid(uid);
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'changeProfileAvatar' })
	public async changeAvatar(
		@Authorized() user: User,
		@Args('avatar', { type: () => GraphQLUpload }, FileValidationPipe)
		avatar: Upload
	) {
		return this.profileService.changeAvatar(user, avatar);
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'removeProfileAvatar' })
	public async removeAvatar(@Authorized() user: User) {
		return this.profileService.removeAvatar(user);
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'changeProfileInfo' })
	public async changeInfo(
		@Authorized() user: User,
		@Args('data') input: ChangeProfileInfoInput
	) {
		return this.profileService.changeInfo(user, input);
	}
}
