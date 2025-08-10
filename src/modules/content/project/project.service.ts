import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '@/src/core/prisma/prisma.service';
import { RedisService } from '@/src/core/redis/redis.service';
import { PaginationInput } from '@/src/shared/inputs/pagination.input';
import { generateSlug } from '@/src/shared/utils/generate-slug.util';

import { CreateProjectInput, UpdateProjectInput } from './inputs/project.input';

@Injectable()
export class ProjectService {
	private readonly logger = new Logger(ProjectService.name);
	private readonly cacheKeyPrefix = 'project:';

	constructor(
		private readonly prismaService: PrismaService,
		private readonly redisService: RedisService
	) {}

	async createProject(authorId: string, input: CreateProjectInput) {
		const slug = await this.generateUniqueSlug(input.title);

		const project = await this.prismaService.project.create({
			data: {
				title: input.title,
				slug,
				images: input.images,
				genres: input.genres,
				engine: input.engine,
				description: input.description,
				isGathering: input.isGathering,
				authorId,
				viewCount: 0,
				isBookmarked: false,
				topics: input.topicIds
					? {
							connect: input.topicIds.map(id => ({ id }))
						}
					: undefined
			},
			include: {
				author: true,
				topics: true,
				platformsLinks: true
			}
		});

		await this.invalidateUserProjectsCache(authorId);
		return project;
	}

	async updateProject(id: string, input: UpdateProjectInput) {
		const data: any = { ...input };

		if (input.title) {
			data.slug = await this.generateUniqueSlug(input.title, id);
		}

		const project = await this.prismaService.project.update({
			where: { id },
			data,
			include: {
				author: true,
				topics: true,
				platformsLinks: true
			}
		});

		await this.invalidateProjectCache(id);
		return project;
	}

	async deleteProject(id: string) {
		const project = await this.prismaService.project.delete({
			where: { id },
			include: { author: true }
		});

		await this.invalidateProjectCache(id);
		await this.invalidateUserProjectsCache(project.authorId);
		return true;
	}

	async findProjectById(id: string) {
		const cacheKey = `${this.cacheKeyPrefix}${id}`;

		try {
			const cached = await this.redisService.get(cacheKey);
			if (cached) return JSON.parse(cached);

			const project = await this.prismaService.project.findUnique({
				where: { id },
				include: {
					author: true,
					topics: true,
					platformsLinks: true,
					comments: {
						include: {
							author: true
						},
						orderBy: { createdAt: 'desc' },
						take: 5
					}
				}
			});

			if (!project) throw new Error('Project not found');

			await this.redisService.set(
				cacheKey,
				JSON.stringify(project),
				'EX',
				3600
			);
			return project;
		} catch (error) {
			this.logger.error(`Error finding project: ${error.message}`);
			throw error;
		}
	}

	async findProjectBySlug(slug: string) {
		const cacheKey = `${this.cacheKeyPrefix}slug:${slug}`;
		try {
			const cached = await this.redisService.get(cacheKey);
			if (cached) return JSON.parse(cached);
			const project = await this.prismaService.project.findUnique({
				where: { slug },
				include: {
					author: true,
					topics: true,
					platformsLinks: true,
					comments: {
						include: {
							author: true
						},
						orderBy: { createdAt: 'desc' },
						take: 5
					}
				}
			});
			if (!project) throw new Error('Project not found');
			await this.redisService.set(
				cacheKey,
				JSON.stringify(project),
				'EX',
				3600
			);
			return project;
		} catch (error) {
			this.logger.error(`Error finding project: ${error.message}`);
			throw error;
		}
	}

	async findProjectsByAuthor(authorId: string, pagination: PaginationInput) {
		const { take, skip, searchTerm } = pagination;

		try {
			const [projects, total] = await Promise.all([
				this.prismaService.project.findMany({
					where: { authorId },
					skip,
					take,
					orderBy: { createdAt: 'desc' },
					include: {
						author: true,
						_count: {
							select: { comments: true, topics: true }
						}
					}
				}),
				this.prismaService.project.count({ where: { authorId } })
			]);

			const result = {
				data: projects,
				total
			};

			return result;
		} catch (error) {
			this.logger.error(`Error finding projects by author: ${error.message}`);
			throw error;
		}
	}

	async findPopularProjects(limit = 10) {
		const cacheKey = `${this.cacheKeyPrefix}popular:${limit}`;

		try {
			const cached = await this.redisService.get(cacheKey);
			if (cached) return JSON.parse(cached);

			const projects = await this.prismaService.project.findMany({
				take: limit,
				orderBy: [{ viewCount: 'desc' }, { createdAt: 'desc' }],
				include: {
					author: true,
					_count: {
						select: { comments: true }
					}
				}
			});

			await this.redisService.set(
				cacheKey,
				JSON.stringify(projects),
				'EX',
				600
			);
			return projects;
		} catch (error) {
			this.logger.error(`Error finding popular projects: ${error.message}`);
			throw error;
		}
	}

	async trackProjectView(
		projectId: string,
		viewerId: string | null,
		ip: string
	) {
		await this.prismaService.$transaction([
			this.prismaService.view.upsert({
				where: {
					viewerId_targetContentType_targetId: {
						viewerId: viewerId || '',
						targetContentType: 'PROJECT',
						targetId: projectId
					}
				},
				create: {
					viewerId,
					ip,
					targetContentType: 'PROJECT',
					targetId: projectId
				},
				update: {
					updatedAt: new Date()
				}
			}),
			this.prismaService.project.update({
				where: { id: projectId },
				data: { viewCount: { increment: 1 } }
			})
		]);

		await this.invalidateProjectCache(projectId);
	}

	async toggleBookmark(userId: string, projectId: string) {
		const existing = await this.prismaService.bookmark.findUnique({
			where: {
				userId_targetContentType_targetId: {
					userId,
					targetContentType: 'PROJECT',
					targetId: projectId
				}
			}
		});

		if (existing) {
			await this.prismaService.$transaction([
				this.prismaService.bookmark.delete({
					where: {
						userId_targetContentType_targetId: {
							userId,
							targetContentType: 'PROJECT',
							targetId: projectId
						}
					}
				}),
				this.prismaService.project.update({
					where: { id: projectId },
					data: { isBookmarked: false }
				})
			]);
			return false;
		} else {
			await this.prismaService.$transaction([
				this.prismaService.bookmark.create({
					data: {
						userId,
						targetContentType: 'PROJECT',
						targetId: projectId
					}
				}),
				this.prismaService.project.update({
					where: { id: projectId },
					data: { isBookmarked: true }
				})
			]);
			return true;
		}
	}

	private async generateUniqueSlug(title: string, excludeId?: string) {
		let slug = generateSlug(title);
		let existing = await this.prismaService.project.findFirst({
			where: {
				slug,
				NOT: { id: excludeId }
			}
		});

		if (existing) {
			const randomSuffix = Math.floor(Math.random() * 10000);
			slug = `${slug}-${randomSuffix}`;
		}

		return slug;
	}

	private async invalidateProjectCache(projectId: string) {
		await this.redisService.del(`${this.cacheKeyPrefix}${projectId}`);
		const keys = await this.redisService.keys(`${this.cacheKeyPrefix}*`);
		if (keys.length > 0) {
			await this.redisService.del(...keys);
		}
	}

	private async invalidateUserProjectsCache(userId: string) {
		const keys = await this.redisService.keys(
			`${this.cacheKeyPrefix}author:${userId}:*`
		);
		if (keys.length > 0) {
			await this.redisService.del(...keys);
		}
		await this.redisService.del(`${this.cacheKeyPrefix}popular:*`);
	}
}
