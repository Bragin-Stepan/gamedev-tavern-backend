import { Field, ID, ObjectType } from '@nestjs/graphql';

import { Bookmark, TargetContentType } from '@/prisma/generated';

@ObjectType()
export class BookmarkModel implements Bookmark {
	@Field(() => ID)
	id: string;

	@Field(() => ID)
	userId: string;

	@Field(() => TargetContentType)
	targetContentType: TargetContentType;

	@Field(() => ID)
	targetId: string;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;
}
