import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';

import type { CandidateCard } from '@/prisma/generated';

@ObjectType()
export class CandidateCardModel implements CandidateCard {
	@Field(() => ID)
	public id: string;

	@Field(() => String)
	public userId: string;

	@Field(() => String)
	public direction: string;

	@Field(() => String)
	public experience: string;

	@Field(() => String)
	public description: string;

	@Field(() => GraphQLJSON, { nullable: true })
	public information: Record<string, any> | null;

	@Field(() => [String])
	public portfolioUrls: string[];

	@Field(() => Date, { nullable: true })
	public hiddenUntil: Date | null;

	@Field(() => Date, { nullable: true })
	public lastPromoted: Date | null;

	@Field(() => Boolean)
	public isHidden: boolean;

	@Field(() => Date)
	public createdAt: Date;

	@Field(() => Date)
	public updatedAt: Date;
}
