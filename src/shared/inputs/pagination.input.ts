import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNumber, IsOptional } from 'class-validator';

@InputType()
export class PaginationInput {
	@Field(() => Int, { defaultValue: 1 })
	@IsOptional()
	@IsNumber()
	page: number;

	@Field(() => Int, { defaultValue: 10 })
	@IsOptional()
	@IsNumber()
	limit: number;
}
