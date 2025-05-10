import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import type { User } from '@/prisma/generated';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { Authorized } from '@/src/shared/decorators/authorized.decorator';

import { CandidateCardService } from './candidate-card.service';
import { CreateCandidateCardInput } from './inputs/candidate-card.input';
import { CandidateCardModel } from './models/candidate-card.model';

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
