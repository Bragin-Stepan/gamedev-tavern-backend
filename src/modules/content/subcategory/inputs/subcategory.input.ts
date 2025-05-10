import { Field, InputType, PartialType } from '@nestjs/graphql';

@InputType()
export class SubcategoryInput {
	@Field()
	title: string;

	@Field()
	slug: string;

	@Field()
	categoryId: string;

	@Field({ nullable: true, defaultValue: 0 })
	position?: number;
}
