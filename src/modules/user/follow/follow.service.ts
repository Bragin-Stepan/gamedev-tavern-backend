import {
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common';

import { User } from '@/prisma/generated';
import { PrismaService } from '@/src/core/prisma/prisma.service';

@Injectable()
export class FollowService {
	public constructor(private readonly prismaService: PrismaService) {}

	public async findMyFollowers(user: User) {
		const followers = await this.prismaService.follow.findMany({
			where: {
				followingId: user.id
			},
			orderBy: {
				createdAt: 'desc'
			},
			include: {
				follower: true
			}
		});

		return followers;
	}

	public async findMyFollowings(user: User) {
		const followings = await this.prismaService.follow.findMany({
			where: {
				followerId: user.id
			},
			orderBy: {
				createdAt: 'desc'
			},
			include: {
				following: true
			}
		});

		return followings;
	}

	public async follow(user: User, profilelId: string) {
		const profile = await this.prismaService.user.findUnique({
			where: {
				id: profilelId
			}
		});

		if (!profile) {
			throw new NotFoundException('Профиль не найден');
		}

		if (profile.id === user.id) {
			throw new ConflictException('Нельзя подписаться на себя');
		}

		const existingFollow = await this.prismaService.follow.findFirst({
			where: {
				followerId: user.id,
				followingId: profile.id
			}
		});

		if (existingFollow) {
			throw new ConflictException('Вы уже подписаны на этот профиль');
		}

		const follow = await this.prismaService.follow.create({
			data: {
				followerId: user.id,
				followingId: profile.id
			}
		});

		return true;
	}

	public async unfollow(user: User, profilelId: string) {
		const profile = await this.prismaService.user.findUnique({
			where: {
				id: profilelId
			}
		});

		if (!profile) {
			throw new NotFoundException('Канал не найден');
		}

		if (profile.id === user.id) {
			throw new ConflictException('Нельзя отписаться отсебя');
		}

		const existingFollow = await this.prismaService.follow.findFirst({
			where: {
				followerId: user.id,
				followingId: profile.id
			}
		});

		if (!existingFollow) {
			throw new ConflictException('Вы не подписаны на этот канал');
		}

		await this.prismaService.follow.delete({
			where: {
				id: existingFollow.id,
				followerId: user.id,
				followingId: profile.id
			}
		});

		return true;
	}
}
