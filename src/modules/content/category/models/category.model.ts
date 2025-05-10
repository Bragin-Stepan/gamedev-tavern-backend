import { Field, ID, ObjectType } from '@nestjs/graphql';

import { Category } from '@/prisma/generated';

import { SubcategoryModel } from '../../subcategory/models/subcategory.model';

@ObjectType()
export class CategoryModel implements Category {
	@Field(() => ID)
	id: string;

	@Field()
	title: string;

	@Field()
	slug: string;

	@Field()
	position: number;

	@Field(() => [SubcategoryModel], { nullable: 'items' })
	subcategories?: SubcategoryModel[];

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;
}
