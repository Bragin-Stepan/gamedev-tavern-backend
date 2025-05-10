import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Request } from 'express';

import { User } from '@/prisma/generated';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { Authorized } from '@/src/shared/decorators/authorized.decorator';
import { PaginationInput } from '@/src/shared/inputs/pagination.input';

import { CreateTopicInput, UpdateTopicInput } from './inputs/topic.input';
import { PaginatedTopics, TopicModel } from './models/topic.model';
import { TopicService } from './topic.service';

@Resolver('Topic')
export class TopicResolver {
	constructor(private readonly topicService: TopicService) {}

	@Authorization()
	@Mutation(() => TopicModel, { name: 'createTopic' })
	async createTopic(
		@Args('data') input: CreateTopicInput,
		@Authorized('id') { id }: User
	) {
		return this.topicService.createTopic(id, input);
	}

	@Authorization()
	@Mutation(() => TopicModel, { name: 'updateTopic' })
	async updateTopic(
		@Args('data') input: UpdateTopicInput,
		@Authorized('id') { id }: User
	) {
		return this.topicService.updateTopic(id, input);
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'deleteTopic' })
	async deleteTopic(@Args('id') id: string) {
		return this.topicService.deleteTopic(id);
	}

	@Query(() => TopicModel, { name: 'topicById' }) //!!!
	async topic(@Args('id') id: string) {
		return this.topicService.findTopicById(id);
	}

	@Query(() => PaginatedTopics, { name: 'topicsBySubcategory' })
	async topicsBySubcategory(
		@Args('subcategoryId') subcategoryId: string,
		@Args('pagination') pagination: PaginationInput
	) {
		return this.topicService.findTopicsBySubcategory(subcategoryId, pagination);
	}

	@Query(() => [TopicModel], { name: 'topicsByAuthor' })
	async popularTopics(@Args('limit', { defaultValue: 10 }) limit: number) {
		return this.topicService.findPopularTopics(limit);
	}

	// @Mutation(() => Boolean, { name: 'trackTopicView' })
	// async trackTopicView(
	// 	@Args('topicId') topicId: string,
	// 	@Context() context: { req: Request },
	// 	@Authorized() user?: User
	// ) {
	// 	const ip = context.req.ip;
	// 	await this.topicService.trackTopicView(topicId, user?.id || null, ip);
	// 	return true;
	// }

	// @Authorization()
	// @Mutation(() => Boolean)
	// async toggleTopicBookmark(
	// 	@Args('topicId') topicId: string,
	// 	@Authorized() user: User
	// ) {
	// 	return this.topicService.toggleBookmark(user.id, topicId);
	// }
}
