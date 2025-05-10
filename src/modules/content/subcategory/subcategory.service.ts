import { Injectable } from '@nestjs/common';

import { Subcategory } from '@/prisma/generated';
import { PrismaService } from '@/src/core/prisma/prisma.service';

import { SubcategoryInput } from './inputs/subcategory.input';

@Injectable()
export class SubcategoryService {
	constructor(private prisma: PrismaService) {}

	async findAll(): Promise<Subcategory[]> {
		return this.prisma.subcategory.findMany({
			include: { category: true, topics: true }
		});
	}

	async findByCategory(categoryId: string): Promise<Subcategory[]> {
		return this.prisma.subcategory.findMany({
			where: { categoryId },
			include: { topics: true }
		});
	}

	async findOne(id: string): Promise<Subcategory | null> {
		return this.prisma.subcategory.findUnique({
			where: { id },
			include: { category: true, topics: true }
		});
	}

	async create(data: SubcategoryInput): Promise<Subcategory> {
		return this.prisma.subcategory.create({
			data: {
				title: data.title,
				slug: data.slug,
				position: data.position,
				category: { connect: { id: data.categoryId } }
			},
			include: { category: true }
		});
	}

	async update(id: string, data: SubcategoryInput): Promise<Subcategory> {
		return this.prisma.subcategory.update({
			where: { id },
			data,
			include: { category: true }
		});
	}

	async delete(id: string): Promise<Subcategory> {
		return this.prisma.subcategory.delete({
			where: { id }
		});
	}
}
