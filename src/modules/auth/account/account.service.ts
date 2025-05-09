import {
	ConflictException,
	Injectable,
	UnauthorizedException
} from '@nestjs/common';
import { hash, verify } from 'argon2';

import { User } from '@/prisma/generated';
import { PrismaService } from '@/src/core/prisma/prisma.service';

import { VerificationService } from '../verification/verification.service';

import { ChangeEmailInput } from './inputs/change-email.input';
import { ChangePasswordInput } from './inputs/change-password.input';
import { CreateUserInput } from './inputs/create-user.input';

@Injectable()
export class AccountService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly verificationService: VerificationService
	) {}

	public async me(id: string) {
		const user = await this.prismaService.user.findUnique({
			where: {
				id
			}
		});

		return user;
	}

	public async create(input: CreateUserInput) {
		const { username, email, password } = input;

		const isUsernameExists = await this.prismaService.user.findUnique({
			where: {
				email
			}
		});

		if (isUsernameExists) {
			throw new ConflictException('Email already exists');
		}

		const lastUid = await this.prismaService.user.findFirst({
			orderBy: {
				uid: 'desc'
			}
		});

		const uid = lastUid ? lastUid.uid + 1 : 1;

		const user = await this.prismaService.user.create({
			data: {
				uid: uid,
				email: email,
				password: await hash(password),
				username: username ?? 'uid-' + uid,
				role: 'USER'
			}
		});

		try {
			await this.verificationService.sendVerificationToken(user);
		} catch (error) {
			console.error(error);
		}

		return true;
	}

	public async changeEmail(user: User, input: ChangeEmailInput) {
		const { email } = input;

		await this.prismaService.user.update({
			where: {
				id: user.id
			},
			data: {
				email
			}
		});

		return true;
	}

	public async changePassword(user: User, input: ChangePasswordInput) {
		const { oldPassword, newPassword } = input;

		const isValidPassword = await verify(user.password, oldPassword);

		if (!isValidPassword) {
			throw new UnauthorizedException('Invalid old password');
		}

		await this.prismaService.user.update({
			where: {
				id: user.id
			},
			data: {
				password: await hash(newPassword)
			}
		});

		return true;
	}
}
