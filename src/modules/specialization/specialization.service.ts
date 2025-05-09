import {
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common';

import { User } from '@/prisma/generated';
import { PrismaService } from '@/src/core/prisma/prisma.service';

import { CreateSpecializationInput } from './inputs/specialization.input';

@Injectable()
export class SpecializationService {
	public constructor(private readonly prismaService: PrismaService) {}

	public async findAll() {
		return this.prismaService.specialization.findMany({
			orderBy: {
				createdAt: 'desc'
			}
		});
	}

	public async create(input: CreateSpecializationInput) {
		const { title, careerPath } = input;

		if (!careerPath) {
			throw new NotFoundException('Напровление карьеры не найдено');
		}

		if (
			await this.prismaService.specialization.findFirst({ where: { title } })
		) {
			throw new ConflictException('Специализация уже существует');
		}

		const specialization = await this.prismaService.specialization.create({
			data: { title, careerPath }
		});
	}

	public async edit() {}
}
