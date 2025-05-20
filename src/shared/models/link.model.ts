import { Field, ID, ObjectType } from '@nestjs/graphql';

import { UserModel } from '@/src/modules/auth/account/models/user.model';

@ObjectType()
export class LinkModel {
	@Field(() => ID)
	public id: string;

	@Field(() => String)
	public title: string;

	@Field(() => String)
	public url: string;

	@Field(() => Number)
	public position: number;

	@Field(() => UserModel)
	public user: UserModel;

	@Field(() => String)
	public userId: string;

	@Field(() => Date)
	public createdAt: Date;

	@Field(() => Date)
	public updatedAt: Date;
}
