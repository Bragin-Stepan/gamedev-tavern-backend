import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { GraphQLJSON } from 'graphql-scalars';

@InputType()
export class CandidateCardInput {
	@Field(() => String)
	@IsString()
	@MaxLength(300, { message: 'Максимальная длина 300 символов' })
	@IsNotEmpty({ message: 'Не указана направление' })
	public direction: string;

	@Field(() => String)
	@IsString()
	@MaxLength(300, { message: 'Максимальная длина 300 символов' })
	@IsNotEmpty({ message: 'Не указан опыт' })
	public experience: string;

	@Field(() => String)
	@IsString()
	@MaxLength(300, { message: 'Максимальная длина 300 символов' })
	@IsNotEmpty({ message: 'Не указано описание' })
	public description: string;

	@Field(() => GraphQLJSON, { nullable: true })
	@IsOptional()
	public information?: Record<string, any> | null;

	@Field(() => [String])
	@IsString({ each: true })
	public portfolioUrls: string[];
}
