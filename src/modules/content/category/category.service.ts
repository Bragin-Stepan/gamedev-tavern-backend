import { ConflictException, Injectable } from '@nestjs/common';

import { Category } from '@/prisma/generated';
import { PrismaService } from '@/src/core/prisma/prisma.service';

import { CategoryInput } from './inputs/category.input';

@Injectable()
export class CategoryService {
	constructor(private prisma: PrismaService) {}

	async findAll(): Promise<Category[]> {
		return this.prisma.category.findMany({
			include: { subcategories: true }
		});
	}

	async findOne(id: string): Promise<Category | null> {
		return this.prisma.category.findUnique({
			where: { id },
			include: { subcategories: true }
		});
	}

	async create(input: CategoryInput): Promise<boolean> {
		const { title, slug, position } = input;

		const validSlug = await this.prisma.category.findUnique({
			where: { slug }
		});

		if (validSlug) {
			throw new ConflictException('Категория с таким slug уже существует');
		}

		this.prisma.category.create({
			data: { title, slug, position }
		});

		return true;
	}

	async update(id: string, input: CategoryInput): Promise<boolean> {
		const { title, slug, position } = input;
		this.prisma.category.update({
			where: { id },
			data: { title, slug, position }
		});

		return true;
	}

	async delete(id: string): Promise<boolean> {
		this.prisma.category.delete({
			where: { id }
		});

		return true;
	}
}
