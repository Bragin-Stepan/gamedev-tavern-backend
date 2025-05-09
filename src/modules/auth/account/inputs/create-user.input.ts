import { Field, InputType } from '@nestjs/graphql';
import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	MinLength
} from 'class-validator';

@InputType()
export class CreateUserInput {
	@Field(() => String)
	@IsString()
	@IsOptional()
	public username?: string;

	@Field(() => String)
	@IsString()
	@IsNotEmpty()
	@IsEmail()
	public email: string;

	@Field(() => String)
	@IsString()
	@IsNotEmpty()
	@MinLength(8)
	public password: string;
}
