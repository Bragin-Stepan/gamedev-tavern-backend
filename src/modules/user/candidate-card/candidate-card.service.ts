import {
	ForbiddenException,
	Injectable,
	NotFoundException
} from '@nestjs/common';

import { User } from '@/prisma/generated';
import { PrismaService } from '@/src/core/prisma/prisma.service';

import { CandidateCardInput } from './inputs/candidate-card.input';

@Injectable()
export class CandidateCardService {
	public constructor(private readonly prismaService: PrismaService) {}

	public async findAll() {
		return this.prismaService.candidateCard.findMany({
			orderBy: {
				lastPromoted: 'desc'
			}
		});
	}

	public async findByUserId(userId: string) {
		return this.prismaService.candidateCard
			.findFirst({
				where: { userId }
			})
			.then(card => {
				if (!card) {
					throw new NotFoundException('Карточка не найдена');
				}
			});
	}

	public async createCard(user: User, input: CandidateCardInput) {
		const { direction, experience, information, description, portfolioUrls } =
			input;

		await this.prismaService.candidateCard.create({
			data: {
				direction,
				experience,
				information,
				description,
				portfolioUrls,
				userId: user.id
			}
		});

		return true;
	}

	public async toggleShowMyCard(user: User) {
		const updatedCard = await this.prismaService.$transaction(async tx => {
			const card = await tx.candidateCard.findFirst({
				where: { userId: user.id },
				select: { id: true, isHidden: true, userId: true }
			});

			if (!card) {
				throw new NotFoundException('Карточка не найдена');
			}

			if (card.userId !== user.id) {
				throw new ForbiddenException('Вы не можете редактировать эту карточку');
			}

			return tx.candidateCard.update({
				where: { id: card.id },
				data: {
					isHidden: !card.isHidden
				},
				select: { isHidden: true }
			});
		});

		return true;
	}

	public async promoteCard() {}

	public async changeCard() {}

	public async changePortfolio() {}
}
