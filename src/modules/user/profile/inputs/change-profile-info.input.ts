import { Field, InputType } from '@nestjs/graphql';
import {
	IsNotEmpty,
	IsOptional,
	IsString,
	Matches,
	MaxLength
} from 'class-validator';

import { LinkInput } from '@/src/shared/inputs/link.input';

import { SpecializationInput } from '../../specialization/inputs/specialization.input';

@InputType()
export class ChangeProfileInfoInput {
	@Field(() => String)
	@IsString()
	@IsNotEmpty()
	public username: string;

	@Field(() => String)
	@IsString()
	@IsOptional()
	@MaxLength(300)
	public status?: string;

	@IsOptional()
	@Field(() => [LinkInput])
	public socialLinks?: LinkInput[];

	@Field(() => String)
	@IsOptional()
	public iconSpecialization?: string;

	@Field(() => String)
	@IsOptional()
	public city?: string;

	@Field(() => SpecializationInput)
	@IsOptional()
	public specialization?: SpecializationInput;
}
