import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class PaginationInput {
	@Field(() => Int, { nullable: true })
	@IsNumber()
	@IsOptional()
	public take?: number;

	@Field(() => Int, { nullable: true })
	@IsNumber()
	@IsOptional()
	public skip?: number;

	@Field(() => String, { nullable: true })
	@IsString()
	@IsOptional()
	public searchTerm?: string;
}
