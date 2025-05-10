import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { User } from '@/prisma/generated';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { Authorized } from '@/src/shared/decorators/authorized.decorator';

import { BookmarkService } from './bookmark.service';
import { BookmarkInput } from './inputs/bookmark.input';
import { BookmarkModel } from './models/bookmark.model';

@Resolver('Bookmark')
export class BookmarkResolver {
	constructor(private readonly bookmarkService: BookmarkService) {}

	// @Authorization()
	// @Query(() => [BookmarkModel], { name: 'myBookmarks' })
	// async myBookmarks(@Authorized() user: User): Promise<BookmarkModel[]> {
	// 	return this.bookmarkService.findByUser(user.id);
	// }

	// @Authorization()
	// @Query(() => Boolean, { name: 'checkBookmark' })
	// async checkBookmark(
	// 	@Authorized() user: User,
	// 	@Args('targetContentType') targetContentType: TargetContentType,
	// 	@Args('targetId') targetId: string
	// ): Promise<boolean> {
	// 	return this.bookmarkService.checkBookmark(
	// 		user.id,
	// 		targetContentType,
	// 		targetId
	// 	);
	// }

	@Authorization()
	@Mutation(() => BookmarkModel, { name: 'toggleBookmark' })
	async toggleBookmark(
		@Authorized() user: User,
		@Args('data') input: BookmarkInput
	): Promise<boolean> {
		return this.bookmarkService.toggleBookmark(user.id, input);
	}
}
