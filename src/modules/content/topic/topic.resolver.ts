import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { User } from '@/prisma/generated';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { Authorized } from '@/src/shared/decorators/authorized.decorator';
import { UserAgent } from '@/src/shared/decorators/user-agent.decorator';
import { PaginationInput } from '@/src/shared/inputs/pagination.input';
import { GqlContext } from '@/src/shared/types/gql-context.types';

import { CreateTopicInput, UpdateTopicInput } from './inputs/topic.input';
import { TopicModel } from './models/topic.model';
import { TopicService } from './topic.service';

@Resolver('Topic')
export class TopicResolver {
	constructor(private readonly topicService: TopicService) {}

	@Authorization()
	@Mutation(() => Boolean, { name: 'createTopic' })
	public async createTopic(
		@Args('data') input: CreateTopicInput,
		@Authorized() user: User
	) {
		return this.topicService.createTopic(user, input);
	}

	@Authorization()
	@Mutation(() => TopicModel, { name: 'updateTopic' })
	public async updateTopic(
		@Args('data') input: UpdateTopicInput,
		@Authorized() { id }: User
	) {
		return this.topicService.updateTopic(id, input);
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'deleteTopic' })
	public async deleteTopic(@Args('id') id: string) {
		return this.topicService.deleteTopic(id);
	}

	@Query(() => TopicModel, { nullable: true, name: 'findTopicBySlug' })
	public async topic(
		@Args('slug') slug: string,
		@Context() { req }: GqlContext,
		@UserAgent() userAgent: string,
		@Authorized() user: User
	) {
		return this.topicService.findTopicBySlug(slug, user, req, userAgent);
	}

	@Query(() => [TopicModel], { name: 'findAllTopics' })
	public async findAllTopics(
		@Args('categoryId', { nullable: true }) categoryId?: string,
		@Args('subcategoryId', { nullable: true }) subcategoryId?: string,
		@Args('pagination') pagination?: PaginationInput
	) {
		return this.topicService.findAllTopics(
			categoryId,
			subcategoryId,
			pagination
		);
	}

	@Query(() => [TopicModel], { name: 'findTopicsByAuthor' })
	public async topicsByAuthor(
		@Args('authorId') authorId: string,
		@Args('pagination') pagination?: PaginationInput
	) {
		return this.topicService.topicsByAuthor(authorId, pagination);
	}
}
