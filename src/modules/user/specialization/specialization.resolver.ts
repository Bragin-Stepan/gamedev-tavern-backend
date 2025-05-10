import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import type { User } from '@/prisma/generated';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { Authorized } from '@/src/shared/decorators/authorized.decorator';

import { CreateSpecializationInput } from './inputs/specialization.input';
import { SpecializationModel } from './models/specialization.model';
import { SpecializationService } from './specialization.service';

@Resolver('Specialization')
export class SpecializationResolver {
	public constructor(
		private readonly specializationService: SpecializationService
	) {}

	@Query(() => [SpecializationModel], { name: 'findAllSpecializations' })
	public async findAll() {
		return this.specializationService.findAll();
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'createSpecialization' })
	public async createSpecialization(
		@Args('data') input: CreateSpecializationInput
	) {
		return this.specializationService.create(input);
	}
}
