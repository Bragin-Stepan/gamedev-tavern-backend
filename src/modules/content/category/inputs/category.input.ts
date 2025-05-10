import { Field, ID, InputType, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CategoryInput {
	@Field()
	@IsString()
	@IsNotEmpty()
	title: string;

	@Field()
	@IsString()
	@IsNotEmpty()
	slug: string;

	@Field({ nullable: true, defaultValue: 0 })
	position?: number;
}
