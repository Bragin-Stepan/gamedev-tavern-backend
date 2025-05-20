import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class CreateProjectInput {
	@Field()
	title: string;

	@Field(() => [String])
	images: string[];

	@Field(() => [String])
	genres: string[];

	@Field()
	description: string;

	@Field(() => [ID], { nullable: true })
	topicIds?: string[];

	@Field(() => Boolean, { defaultValue: false })
	isGathering?: boolean;
}

@InputType()
export class UpdateProjectInput {
	@Field(() => ID)
	id: string;

	@Field({ nullable: true })
	title?: string;

	@Field(() => [String], { nullable: true })
	images?: string[];

	@Field(() => [String], { nullable: true })
	genres?: string[];

	@Field({ nullable: true })
	description?: string;

	@Field(() => Boolean, { nullable: true })
	isGathering?: boolean;
}
