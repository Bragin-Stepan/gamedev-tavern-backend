import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common';
import type { Request } from 'express';

import { TokenType, User } from '@/prisma/generated';
import { PrismaService } from '@/src/core/prisma/prisma.service';
import { generateToken } from '@/src/shared/utils/generate-token.util';
import { getSessionMetadata } from '@/src/shared/utils/session-metadata.util';
import { saveSession } from '@/src/shared/utils/session.util';

import { MailService } from '../../libs/mail/mail.service';
import { RateLimitService } from '../../libs/rate-limit/rate-limit.service';

import { VerificationInput } from './inputs/verification.input';

@Injectable()
export class VerificationService {
	private readonly EMAIL_RATE_LIMIT_KEY = 'email_token_sent:';
	private readonly EMAIL_RATE_LIMIT_TTL = 60;

	public constructor(
		private readonly prismaService: PrismaService,
		private readonly mailSerivce: MailService,
		private readonly rateLimitService: RateLimitService
	) {}

	public async verify(
		req: Request,
		input: VerificationInput,
		userAgent: string
	) {
		const { token } = input;

		const existingToken = await this.prismaService.token.findUnique({
			where: {
				token,
				type: TokenType.EMAIL_VERIFY
			}
		});

		if (!existingToken) {
			throw new NotFoundException('Токен не найден');
		}

		const hasExpired = new Date(existingToken.expiresIn) < new Date();

		if (hasExpired) {
			throw new BadRequestException('Токен истек');
		}

		const user = await this.prismaService.user.update({
			where: {
				id: existingToken.userId
			},
			data: {
				isEmailVerified: true
			}
		});

		await this.prismaService.token.delete({
			where: {
				id: existingToken.id,
				type: TokenType.EMAIL_VERIFY
			}
		});

		const metadata = getSessionMetadata(req, userAgent);

		return saveSession(req, user, metadata);
	}

	async sendVerificationToken(user: User) {
		const email = user.email;
		const key = `${this.EMAIL_RATE_LIMIT_KEY}${email}`;

		await this.rateLimitService.check(key, this.EMAIL_RATE_LIMIT_TTL);

		const verificationToken = await generateToken(
			this.prismaService,
			user,
			TokenType.EMAIL_VERIFY
		);

		try {
			await this.mailSerivce.sendVerificationToken(
				email,
				verificationToken.token
			);
		} catch (error) {
			console.error('Ошибка отправки письма:', error.message);
			throw new BadRequestException('Не удалось отправить письмо');
		}

		return true;
	}
}
