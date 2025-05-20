import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Request } from 'express';

import { User } from '@/prisma/generated';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { Authorized } from '@/src/shared/decorators/authorized.decorator';
import { PaginationInput } from '@/src/shared/inputs/pagination.input';

import { CreateProjectInput, UpdateProjectInput } from './inputs/project.input';
import { PaginatedProjects, ProjectModel } from './models/project.model';
import { ProjectService } from './project.service';

@Resolver('Project')
export class ProjectResolver {
	constructor(private readonly projectService: ProjectService) {}

	@Authorization()
	@Mutation(() => ProjectModel, { name: 'createProject' })
	async createProject(
		@Args('data') input: CreateProjectInput,
		@Authorized() user: User
	) {
		return this.projectService.createProject(user.id, input);
	}

	@Authorization()
	@Mutation(() => ProjectModel, { name: 'updateProject' })
	async updateProject(@Args('data') input: UpdateProjectInput) {
		return this.projectService.updateProject(input.id, input);
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'deleteProject' })
	async deleteProject(@Args('id') id: string) {
		return this.projectService.deleteProject(id);
	}

	@Query(() => ProjectModel, { name: 'findProjectById' })
	async project(@Args('id') id: string) {
		return this.projectService.findProjectById(id);
	}

	@Query(() => ProjectModel, { nullable: true, name: 'findProjectBySlug' })
	async projectBySlug(@Args('slug') slug: string) {
		return this.projectService.findProjectBySlug(slug);
	}

	@Query(() => PaginatedProjects, { name: 'findProjectsByAuthor' })
	async projectsByAuthor(
		@Args('authorId') authorId: string,
		@Args('pagination') pagination: PaginationInput
	) {
		return this.projectService.findProjectsByAuthor(authorId, pagination);
	}

	@Query(() => [ProjectModel], { name: 'findPopularProjects' })
	async popularProjects(@Args('limit', { defaultValue: 10 }) limit: number) {
		return this.projectService.findPopularProjects(limit);
	}

	// @Mutation(() => Boolean)
	// async trackProjectView(
	// 	@Args('projectId') projectId: string,
	// 	@Context() context: { req: Request },
	// 	@Authorized() user?: User
	// ) {
	// 	const ip = context.req.ip;
	// 	await this.projectService.trackProjectView(projectId, user?.id || null, ip);
	// 	return true;
	// }

	// @Authorization()
	// @Mutation(() => Boolean)
	// async toggleProjectBookmark(
	// 	@Args('projectId') projectId: string,
	// 	@Authorized() user: User
	// ) {
	// 	return this.projectService.toggleBookmark(user.id, projectId);
	// }
}
