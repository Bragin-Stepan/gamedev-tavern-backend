import {
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common';

import { Category } from '@/prisma/generated';
import { PrismaService } from '@/src/core/prisma/prisma.service';

import { CategoryInput } from './inputs/category.input';

@Injectable()
export class CategoryService {
	constructor(private prismaService: PrismaService) {}

	async findAll() {
		return this.prismaService.category.findMany({
			include: { subcategories: true }
		});
	}

	async findOne(slug: string) {
		const category = await this.prismaService.category
			.findUnique({
				where: { slug },
				include: { subcategories: true }
			})
			.catch(() => {
				throw new NotFoundException('Категория не найдена');
			});

		return category;
	}

	async create(input: CategoryInput) {
		const { title, slug, position } = input;

		const validData = await this.prismaService.category.findFirst({
			where: { OR: [{ title }, { slug }] },
			select: { id: true }
		});

		if (validData) {
			throw new ConflictException(
				'Категория с таким slug или заголовком уже существует'
			);
		}

		await this.prismaService.category.create({
			data: { title, slug, position, subcategories: { create: [] } }
		});

		return true;
	}

	async update(id: string, input: CategoryInput) {
		const { title, slug, position } = input;

		const validId = await this.prismaService.category.findUnique({
			where: { id }
		});

		if (!validId) {
			throw new NotFoundException('Категория не найдена');
		}

		await this.prismaService.category.update({
			where: { id },
			data: { title: title, slug: slug, position: position }
		});

		return true;
	}

	async delete(id: string) {
		await this.prismaService.category
			.delete({
				where: { id }
			})
			.catch(() => {
				throw new NotFoundException('Категория не найдена');
			});

		return true;
	}
}
