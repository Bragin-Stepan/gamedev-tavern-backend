import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';

import { PathCareerType, Specialization } from '@/prisma/generated';

registerEnumType(PathCareerType, {
	name: 'PathCareerType'
});

@ObjectType()
export class SpecializationModel implements Specialization {
	@Field(() => ID)
	public id: string;

	@Field(() => String)
	public title: string;

	@Field(() => PathCareerType)
	public careerPath: PathCareerType;

	@Field(() => Date)
	public createdAt: Date;

	@Field(() => Date)
	public updatedAt: Date;
}
