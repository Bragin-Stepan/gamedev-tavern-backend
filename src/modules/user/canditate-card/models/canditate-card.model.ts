import { Field, ID, ObjectType } from '@nestjs/graphql';

import type { CandidateCard, PathCareerType } from '@/prisma/generated';

@ObjectType()
export class CandidateCardModel implements CandidateCard {
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
