import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { GraphQLJSON } from 'graphql-scalars';

@InputType()
export class CreateTopicInput {
	@Field()
	@IsString()
	@IsNotEmpty()
	title: string;

	@Field(() => GraphQLJSON)
	contentBlocks: Record<string, any> | null;

	@Field(() => ID)
	@IsNotEmpty()
	subcategoryId: string;

	@Field(() => ID, { nullable: true })
	attachedProjectId?: string;
}

@InputType()
export class UpdateTopicInput {
	@Field(() => ID)
	@IsString()
	@IsNotEmpty()
	id: string;

	@Field({ nullable: true })
	@IsString()
	title?: string;

	@Field(() => GraphQLJSON)
	contentBlocks: Record<string, any> | null;

	@Field(() => ID, { nullable: true })
	subcategoryId?: string;

	@Field(() => ID, { nullable: true })
	attachedProjectId?: string;
}
