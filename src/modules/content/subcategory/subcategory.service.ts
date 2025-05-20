import {
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common';

import { Subcategory } from '@/prisma/generated';
import { PrismaService } from '@/src/core/prisma/prisma.service';
import { PaginationInput } from '@/src/shared/inputs/pagination.input';

import { SubcategoryInput } from './inputs/subcategory.input';

@Injectable()
export class SubcategoryService {
	constructor(private prismaService: PrismaService) {}

	public async findAll() {
		return this.prismaService.subcategory.findMany({
			include: { category: true, topics: true }
		});
	}

	public async byCategory(slug: string) {
		const subcategories = await this.prismaService.subcategory.findMany({
			where: { category: { slug } },
			include: { topics: true, category: true }
		});

		if (!subcategories.length) {
			throw new NotFoundException('Подкатегории не найдены');
		}

		return subcategories;
	}

	public async popular(pagination?: PaginationInput) {
		const { skip, take } = pagination;

		return this.prismaService.subcategory.findMany({
			orderBy: { topics: { _count: 'desc' } },
			take: take ?? 4,
			skip: skip ?? 0,
			include: {
				topics: {
					include: {
						author: {
							include: {
								socialLinks: true,
								specialization: true,
								candidateCard: true
							}
						},
						subcategory: {
							include: {
								category: true
							}
						},
						comments: true
					},
					take: 3
				},
				category: { include: { subcategories: true } }
			}
		});
	}

	public async create(data: SubcategoryInput): Promise<boolean> {
		const { title, slug, categoryId } = data;

		const existingSubcategory = await this.prismaService.subcategory.findFirst({
			where: {
				categoryId,
				OR: [{ title }, { slug }]
			}
		});

		if (existingSubcategory) {
			throw new ConflictException(
				'Подкатегория с таким slug или заголовком уже существует в этой категории'
			);
		}

		await this.prismaService.subcategory.create({
			data: {
				title,
				slug,
				position: data.position,
				category: { connect: { id: categoryId } }
			},
			include: {
				category: true
			}
		});

		return true;
	}

	public async update(id: string, data: SubcategoryInput) {
		const { title, slug, position, categoryId } = data;

		const existingSubcategory = await this.prismaService.subcategory.findFirst({
			where: {
				categoryId,
				OR: [{ title }, { slug }]
			}
		});

		if (existingSubcategory) {
			throw new ConflictException(
				'Подкатегория с таким slug или заголовком уже существует в этой категории'
			);
		}

		await this.prismaService.subcategory.update({
			where: { id },
			data: {
				title: title,
				slug: slug,
				position: position,
				categoryId: categoryId
			},
			include: { category: true }
		});

		return true;
	}

	public async delete(id: string) {
		await this.prismaService.subcategory
			.delete({
				where: { id }
			})
			.catch(() => {
				throw new NotFoundException('Подкатегория не найдена');
			});

		return true;
	}
}
