import { Field, InputType } from '@nestjs/graphql';
import {
	IsNotEmpty,
	IsOptional,
	IsString,
	Matches,
	MaxLength
} from 'class-validator';

import { SpecializationInput } from '../../specialization/inputs/specialization.input';

import { SocialLinkInput } from './social-link.input';

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
	@Field(() => [SocialLinkInput])
	public socialLinks?: SocialLinkInput[];

	@Field(() => String)
	@IsOptional()
	public iconSpecialization?: string;

	@Field(() => SpecializationInput)
	@IsOptional()
	public specialization?: SpecializationInput;
}
