import { Field, ID, ObjectType } from '@nestjs/graphql';

import { Subcategory } from '@/prisma/generated';

import { CategoryModel } from '../../category/models/category.model';

// import { TopicModel } from '../topic/topic.model';

@ObjectType()
export class SubcategoryModel implements Subcategory {
	@Field(() => ID)
	id: string;

	@Field()
	categoryId: string;

	@Field()
	title: string;

	@Field()
	slug: string;

	@Field()
	position: number;

	@Field(() => CategoryModel)
	category: CategoryModel;

	// @Field(() => [TopicModel], { nullable: 'items' })
	// topics?: TopicModel[];

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;
}
