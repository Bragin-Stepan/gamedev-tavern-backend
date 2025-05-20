import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { RoleType } from '@/prisma/generated';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { PaginationInput } from '@/src/shared/inputs/pagination.input';

import { SubcategoryInput } from './inputs/subcategory.input';
import { SubcategoryModel } from './models/subcategory.model';
import { SubcategoryService } from './subcategory.service';

@Resolver('Subcategory')
export class SubcategoryResolver {
	public constructor(private readonly subcategoryService: SubcategoryService) {}

	@Query(() => [SubcategoryModel], { name: 'findAllSubcategories' })
	public async findAll() {
		return this.subcategoryService.findAll();
	}

	@Query(() => [SubcategoryModel], { name: 'findPopularSubcategories' })
	public async popular(@Args('pagination') pagination?: PaginationInput) {
		return this.subcategoryService.popular(pagination);
	}

	@Query(() => [SubcategoryModel], { name: 'findSubcategoriesByCategory' })
	public async byCategory(@Args('slug') slug: string) {
		return this.subcategoryService.byCategory(slug);
	}

	@Authorization(RoleType.ADMIN)
	@Mutation(() => Boolean, { name: 'createSubcategory' })
	public async createSubcategory(@Args('data') input: SubcategoryInput) {
		return this.subcategoryService.create(input);
	}

	@Authorization(RoleType.ADMIN)
	@Mutation(() => Boolean, { name: 'updateSubcategory' })
	public async updateSubcategory(
		@Args('slug') slug: string,
		@Args('data') input: SubcategoryInput
	) {
		return this.subcategoryService.update(slug, input);
	}

	@Authorization(RoleType.ADMIN)
	@Mutation(() => Boolean, { name: 'deleteSubcategory' })
	public async deleteSubcategory(@Args('id') id: string) {
		return this.subcategoryService.delete(id);
	}
}
