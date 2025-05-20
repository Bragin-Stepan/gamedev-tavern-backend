import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { GraphQLJSON } from 'graphql-scalars';

@InputType()
export class CreateTopicInput {
	@Field()
	@IsString()
	@IsNotEmpty()
	title: string;

	@Field(() => GraphQLJSON)
	contentBlocks: Record<string, any> | null;

	@Field(() => String)
	@IsNotEmpty()
	subcategoryId: string;

	@Field(() => String, { nullable: true })
	@IsOptional()
	attachedProjectId?: string;
}

@InputType()
export class UpdateTopicInput {
	@Field(() => ID)
	@IsString()
	@IsNotEmpty()
	id: string;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	title?: string;

	@Field(() => GraphQLJSON)
	contentBlocks: Record<string, any> | null;

	@Field(() => String, { nullable: true })
	@IsOptional()
	subcategoryId?: string;

	@Field(() => String, { nullable: true })
	@IsOptional()
	attachedProjectId?: string;
}
