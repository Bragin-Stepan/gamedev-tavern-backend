import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

import { TargetContentType } from '@/prisma/generated';

@InputType()
export class BookmarkInput {
	@Field(() => TargetContentType, {
		description: 'Тип контента, который добавить в избранные'
	})
	@IsNotEmpty()
	targetContentType: TargetContentType;

	@Field(() => ID, {
		description: 'id контента'
	})
	@IsString()
	@IsNotEmpty()
	targetId: string;
}
