import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { TargetContentType, View } from '@prisma/generated';

@ObjectType()
export class ViewModel implements View {
	@Field(() => ID)
	id: string;

	@Field(() => ID)
	viewerId: string;

	@Field(() => String, { nullable: true })
	ip: string;

	@Field(() => TargetContentType)
	targetContentType: TargetContentType;

	@Field(() => ID)
	targetId: string;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;
}
