import {
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common';

import { User } from '@/prisma/generated';
import { PrismaService } from '@/src/core/prisma/prisma.service';

import { CreateCandidateCardInput } from './inputs/candidate-card.input';

@Injectable()
export class CandidateCardService {
	public constructor(private readonly prismaService: PrismaService) {}

	public async findAll() {
		return this.prismaService.candidateCard.findMany({
			orderBy: {
				createdAt: 'desc'
			}
		});
	}

	public async create(input: CreateCandidateCardInput) {
		const { title, careerPath } = input;

		if (!careerPath) {
			throw new NotFoundException('Напровление карьеры не найдено');
		}

		if (
			await this.prismaService.candidateCard.findFirst({ where: { title } })
		) {
			throw new ConflictException('Специализация уже существует');
		}

		const candidateCard = await this.prismaService.candidateCard.create({
			data: { title, careerPath }
		});

		return candidateCard;
	}

	public async edit() {}
}
