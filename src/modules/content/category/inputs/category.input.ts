import { Field, ID, InputType, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CategoryInput {
	@Field({
		description: 'Заголовок категории'
	})
	@IsString({
		message: 'Заголовок должен быть строкой'
	})
	@IsNotEmpty({
		message: 'Заголовок не может быть пустым'
	})
	title: string;

	@Field({
		description: 'Slug категории'
	})
	@IsString({
		message: 'Slug должен быть строкой'
	})
	@IsNotEmpty({
		message: 'Slug не может быть пустым'
	})
	slug: string;

	@Field(() => Number, { nullable: true, defaultValue: 0 })
	@IsOptional()
	position?: number;
}
