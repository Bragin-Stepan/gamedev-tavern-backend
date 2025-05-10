import { Field, ID, ObjectType } from '@nestjs/graphql';

import type { PathCareerType, Specialization } from '@/prisma/generated';

@ObjectType()
export class SpecializationModel implements Specialization {
	@Field(() => ID)
	public id: string;

	@Field(() => String)
	public title: string;

	@Field(() => String)
	public careerPath: PathCareerType;

	@Field(() => Date)
	public createdAt: Date;

	@Field(() => Date)
	public updatedAt: Date;
}
