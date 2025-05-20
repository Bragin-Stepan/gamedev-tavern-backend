import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class SubcategoryInput {
	@Field(() => String)
	@IsString({
		message: 'Заголовок должен быть строкой'
	})
	@IsNotEmpty({
		message: 'Заголовок не может быть пустым'
	})
	title: string;

	@Field(() => String)
	@IsString({
		message: 'Slug должен быть строкой'
	})
	@IsNotEmpty({
		message: 'Slug не может быть пустым'
	})
	slug: string;

	@Field(() => String)
	@IsString({
		message: 'id категории должен быть строкой'
	})
	@IsNotEmpty({
		message: 'id категории не может быть пустым'
	})
	categoryId: string;

	@Field(() => Number, { nullable: true, defaultValue: 0 })
	position?: number;
}
