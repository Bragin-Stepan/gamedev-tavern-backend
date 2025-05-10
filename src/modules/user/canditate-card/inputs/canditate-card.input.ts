import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { PathCareerType } from '@/prisma/generated';

@InputType()
export class CandidateCardInput {
	@Field(() => String)
	@IsString()
	@IsNotEmpty()
	public title: string;
}

@InputType()
export class CreateCandidateCardInput {
	@Field(() => String)
	@IsString()
	@IsNotEmpty()
	public title: string;

	@Field(() => String)
	@IsString()
	@IsNotEmpty()
	public careerPath: PathCareerType;
}
