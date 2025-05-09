import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verify } from 'argon2';
import { type Request } from 'express';

import { PrismaService } from '@/src/core/prisma/prisma.service';
import { RedisService } from '@/src/core/redis/redis.service';
import { getSessionMetadata } from '@/src/shared/utils/session-metadata.util';
import { destroySession, saveSession } from '@/src/shared/utils/session.util';

import { VerificationService } from '../verification/verification.service';

import { LoginInput } from './inputs/login.input';

@Injectable()
export class SessionService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly redisService: RedisService,
		private readonly configService: ConfigService,
		private readonly verificationService: VerificationService
	) {}

	/**
	 * Поиск сессий пользователя
	 */
	public async findByUser(req: Request) {
		const userId = req.session.userId;

		if (!userId) {
			throw new NotFoundException('Пользователь не найден в сессии');
		}

		const keys = await this.redisService.keys('*');
		const userSessions = [];

		for (const key of keys) {
			const sessionData = await this.redisService.get(key);

			if (sessionData) {
				const session = JSON.parse(sessionData);

				if (session.userId === userId) {
					userSessions.push({
						...session,
						id: key.split(':')[1]
					});
				}
			}
		}

		userSessions.sort((a, b) => b.createdAt - a.createdAt);

		return userSessions.filter(session => session.id !== req.session.id);
	}

	/**
	 * Авторизация пользователя
	 */
	public async login(req: Request, input: LoginInput, userAgent: string) {
		const { login, password, pin } = input;

		const user = await this.prismaService.user.findFirst({
			where: {
				OR: [{ email: { equals: login } }]
			}
		});

		if (!user) {
			throw new NotFoundException('Пользователь не найден');
		}

		const isValidPassword = await verify(user.password, password);
		if (!isValidPassword) {
			throw new UnauthorizedException('Неверный пароль');
		}

		if (!user.isEmailVerified) {
			await this.verificationService.sendVerificationToken(user);
			throw new BadRequestException(
				'Почта не подтверждена. Код подтверждения отправлен на вашу почту.'
			);
		}

		const metadata = getSessionMetadata(req, userAgent);

		return saveSession(req, user, metadata);
	}

	/**
	 * Выход пользователя
	 */
	public async logout(req: Request) {
		return destroySession(req, this.configService);
	}

	/**
	 * Получение текущей сессии
	 */
	public async findCurrent(req: Request) {
		const sessionId = req.session.id;

		const sessionData = await this.redisService.get(
			`${this.configService.getOrThrow<string>('SESSION_FOLDER')}${sessionId}`
		);

		const session = JSON.parse(sessionData);

		return {
			...session,
			id: sessionId
		};
	}

	public async clearSession(req: Request) {
		req.res.clearCookie(this.configService.getOrThrow<string>('SESSION_NAME'));

		return true;
	}

	/**
	 * Удаление сессии
	 */
	public async remove(req: Request, id: string) {
		if (req.session.id === id) {
			throw new ConflictException('Вы не можете удалить свою сессию');
		}

		await this.redisService.del(
			`${this.configService.getOrThrow<string>('SESSION_FOLDER')}${id}`
		);

		return true;
	}
}
