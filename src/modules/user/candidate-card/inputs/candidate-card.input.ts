import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { GraphQLJSON } from 'graphql-scalars';

@InputType()
export class CandidateCardInput {
	@Field(() => String)
	@IsString()
	@IsNotEmpty()
	public direction: string;

	@Field(() => String)
	@IsString()
	@IsNotEmpty()
	public experience: string;

	@Field(() => String)
	@IsString()
	@IsNotEmpty()
	public description: string;

	@Field(() => GraphQLJSON, { nullable: true })
	@IsOptional()
	public information?: Record<string, any> | null;

	@Field(() => [String])
	@IsString({ each: true })
	public portfolioUrls: string[];
}
