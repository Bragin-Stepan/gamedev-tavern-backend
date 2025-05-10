import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import type { User } from '@/prisma/generated';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { Authorized } from '@/src/shared/decorators/authorized.decorator';

import { CandidateCardService } from './candidate-card.service';
import { CandidateCardInput } from './inputs/candidate-card.input';
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

	@Query(() => CandidateCardModel, { name: 'findCandidateCardByUserId' })
	public async findByUserId(@Args('userId') userId: string) {
		return this.candidateCardService.findByUserId(userId);
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'createCandidateCard' })
	public async createCandidateCard(
		@Authorized() user: User,
		@Args('data') input: CandidateCardInput
	) {
		return this.candidateCardService.createCard(user, input);
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'toggleShowMyCard' })
	public async toggleShowMyCard(@Authorized() user: User) {
		return this.candidateCardService.toggleShowMyCard(user);
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'hoistingCard' })
	public async hoistingCard(@Authorized() user: User) {
		return this.candidateCardService.hoistingCard(user);
	}
}
