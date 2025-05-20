import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { RoleType } from '@/prisma/generated';
import { Authorization } from '@/src/shared/decorators/auth.decorator';

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

	@Authorization(RoleType.ADMIN)
	@Mutation(() => Boolean, { name: 'createSpecialization' })
	public async createSpecialization(
		@Args('data') input: CreateSpecializationInput
	) {
		return this.specializationService.create(input);
	}
}
