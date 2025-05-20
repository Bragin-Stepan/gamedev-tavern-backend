import { Field, ID, InputType } from '@nestjs/graphql';

import { TargetContentType } from '@/prisma/generated';

@InputType()
export class CreateCommentInput {
	@Field()
	content: string;

	@Field(() => TargetContentType)
	targetContentType: TargetContentType;

	@Field(() => ID)
	targetId: string;

	@Field(() => ID, { nullable: true })
	parentId?: string;
}

@InputType()
export class UpdateCommentInput {
	@Field(() => ID)
	id: string;

	@Field()
	content: string;
}
