import {
	BadRequestException,
	ConflictException,
	Injectable
} from '@nestjs/common';
import * as Upload from 'graphql-upload/Upload.js';
import * as sharp from 'sharp';

import type { User } from '@/prisma/generated';
import { PrismaService } from '@/src/core/prisma/prisma.service';

import { StorageService } from '../../libs/storage/storage.service';

import { ChangeProfileInfoInput } from './inputs/change-profile-info.input';
import { SocialLinkInput } from './inputs/social-link.input';

@Injectable()
export class ProfileService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly storageService: StorageService
	) {}

	public async changeAvatar(user: User, file: Upload) {
		if (user.avatar) {
			await this.storageService.remove(user.avatar);
		}

		const chunks: Buffer[] = [];

		for await (const chunk of file.createReadStream()) {
			chunks.push(chunk);
		}

		const buffer = Buffer.concat(chunks);

		const fileName = `/profile/${user.uid}.webp`;

		if (file.filename && file.filename.endsWith('.gif')) {
			const processedBuffer = await sharp(buffer, { animated: true })
				.resize(512, 512)
				.webp()
				.toBuffer();

			await this.storageService.upload(processedBuffer, fileName, 'image/webp');
		} else {
			const processedBuffer = await sharp(buffer)
				.resize(512, 512)
				.webp()
				.toBuffer();

			await this.storageService.upload(processedBuffer, fileName, 'image/webp');
		}

		await this.prismaService.user.update({
			where: {
				id: user.id
			},
			data: {
				avatar: fileName
			}
		});

		return true;
	}

	public async removeAvatar(user: User) {
		if (!user.avatar) {
			return;
		}

		await this.storageService.remove(user.avatar);

		await this.prismaService.user.update({
			where: {
				id: user.id
			},
			data: {
				avatar: null
			}
		});

		return true;
	}

	public async changeInfo(user: User, input: ChangeProfileInfoInput) {
		const {
			username,
			status,
			socialLinks,
			iconSpecialization,
			specialization
		} = input;

		const specializationValid =
			await this.prismaService.specialization.findUnique({
				where: { title: specialization.title }
			});

		if (!specializationValid) {
			throw new BadRequestException('Такой специализации не существует');
		}

		await this.prismaService.user.update({
			where: {
				id: user.id
			},
			data: {
				username,
				status,
				iconSpecialization,

				specialization: {
					delete: true,
					connect: { id: specializationValid.id },
					create: { title: specialization.title }
				},

				socialLinks: socialLinks && {
					deleteMany: {},
					create: socialLinks.map((link, index) => ({
						title: link.title,
						url: link.url,
						position: index + 1
					}))
				}
			}
		});

		return true;
	}
}
