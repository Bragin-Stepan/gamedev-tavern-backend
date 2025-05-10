import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { RoleType } from '@/prisma/generated';
import { Authorization } from '@/src/shared/decorators/auth.decorator';

import { CategoryService } from './category.service';
import { CategoryInput } from './inputs/category.input';
import { CategoryModel } from './models/category.model';

@Resolver('Category')
export class CategoryResolver {
	public constructor(private readonly categoryService: CategoryService) {}

	@Query(() => [CategoryModel], { name: 'findAllCategories' })
	public async categories() {
		return this.categoryService.findAll();
	}

	@Query(() => CategoryModel, { name: 'findOneCategory' })
	public async category(@Args('id') id: string) {
		return this.categoryService.findOne(id);
	}

	@Authorization(RoleType.ADMIN)
	@Mutation(() => Boolean, { name: 'createCategory' })
	public async createCategory(@Args('data') input: CategoryInput) {
		return this.categoryService.create(input);
	}

	@Authorization(RoleType.ADMIN)
	@Mutation(() => Boolean, { name: 'updateCategory' })
	public async updateCategory(
		@Args('id') id: string,
		@Args('data') input: CategoryInput
	) {
		return this.categoryService.update(id, input);
	}

	@Authorization(RoleType.ADMIN)
	@Mutation(() => Boolean, { name: 'deleteCategory' })
	public async deleteCategory(@Args('id') id: string) {
		return this.categoryService.delete(id);
	}
}
