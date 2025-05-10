import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import type { User } from '@/prisma/generated';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { Authorized } from '@/src/shared/decorators/authorized.decorator';

import { CandidateCardService } from './canditate-card.service';
import { CreateCandidateCardInput } from './inputs/canditate-card.input';
import { CandidateCardModel } from './models/canditate-card.model';

@Resolver('CandidateCard')
export class CandidateCardResolver {
	public constructor(
		private readonly candidateCardService: CandidateCardService
	) {}

	@Query(() => [CandidateCardModel], { name: 'findAllCandidateCards' })
	public async findAll() {
		return this.candidateCardService.findAll();
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'createCandidateCard' })
	public async createCandidateCard(
		@Args('data') input: CreateCandidateCardInput
	) {
		return this.candidateCardService.create(input);
	}
}
