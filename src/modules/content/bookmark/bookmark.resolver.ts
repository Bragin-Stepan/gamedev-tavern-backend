import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { User } from '@/prisma/generated';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { Authorized } from '@/src/shared/decorators/authorized.decorator';

import { BookmarkService } from './bookmark.service';
import { BookmarkInput } from './inputs/bookmark.input';
import { BookmarkModel } from './models/bookmark.model';

@Resolver('Bookmark')
export class BookmarkResolver {
	constructor(private readonly bookmarkService: BookmarkService) {}

	@Authorization()
	@Query(() => [BookmarkModel], { name: 'findMyBookmarks' })
	async findMyBookmarks(@Authorized() { id }: User) {
		return this.bookmarkService.findMyBookmarks(id);
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'toggleBookmark' })
	async toggleBookmark(
		@Authorized() { id }: User,
		@Args('data') input: BookmarkInput
	): Promise<boolean> {
		return this.bookmarkService.toggleBookmark(id, input);
	}
}
