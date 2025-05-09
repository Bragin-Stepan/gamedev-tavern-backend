import { Field, InputType } from '@nestjs/graphql';
import {
	IsNotEmpty,
	IsOptional,
	IsString,
	Matches,
	MaxLength
} from 'class-validator';

import type { RouteSpecializationType } from '@/prisma/generated';

@InputType()
class SocialLinkInput {
	@Field(() => String)
	@IsString()
	@IsNotEmpty()
	public title: string;

	@Field(() => String)
	@IsString()
	@IsNotEmpty()
	@Matches(/^https?:\/\//, { each: true })
	public url: string;
}

class Specialization {
	@Field(() => String)
	@IsString()
	@IsNotEmpty()
	public title: string;

	public route: RouteSpecializationType;
}

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

	@Field(() => [SocialLinkInput])
	@IsOptional()
	public socialLinks?: SocialLinkInput[];

	public specialization;
}
