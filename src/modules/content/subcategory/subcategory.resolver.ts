import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { RoleType } from '@/prisma/generated';
import { Authorization } from '@/src/shared/decorators/auth.decorator';

import { SubcategoryInput } from './inputs/subcategory.input';
import { SubcategoryModel } from './models/subcategory.model';
import { SubcategoryService } from './subcategory.service';

@Resolver('Subcategory')
export class SubcategoryResolver {
	public constructor(private readonly subcategoryService: SubcategoryService) {}

	@Query(() => [SubcategoryModel], { name: 'findAllSubcategories' })
	async findAll() {
		return this.subcategoryService.findAll();
	}

	@Query(() => [SubcategoryModel], { name: 'findSubcategoriesByCategory' })
	async findSubcategoriesByCategory(@Args('categoryId') categoryId: string) {
		return this.subcategoryService.findByCategory(categoryId);
	}

	@Query(() => SubcategoryModel, { name: 'findSubcategoryById' })
	async findSubcategoryById(@Args('id') id: string) {
		return this.subcategoryService.findOne(id);
	}

	@Authorization(RoleType.ADMIN)
	@Mutation(() => SubcategoryModel, { name: 'createSubcategory' })
	async createSubcategory(@Args('data') input: SubcategoryInput) {
		return this.subcategoryService.create(input);
	}

	@Authorization(RoleType.ADMIN)
	@Mutation(() => SubcategoryModel, { name: 'updateSubcategory' })
	async updateSubcategory(
		@Args('id') id: string,
		@Args('data') input: SubcategoryInput
	) {
		return this.subcategoryService.update(id, input);
	}

	@Authorization(RoleType.ADMIN)
	@Mutation(() => SubcategoryModel, { name: 'deleteSubcategory' })
	async deleteSubcategory(@Args('id') id: string) {
		return this.subcategoryService.delete(id);
	}
}
