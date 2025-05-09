import { BadRequestException, Injectable } from '@nestjs/common';

import { RedisService } from '@/src/core/redis/redis.service';

const RATE_LIMIT_TTL = 60;

@Injectable()
export class RateLimitService {
	constructor(private readonly redisService: RedisService) {}

	/**
	 * Проверяет, можно ли выполнить действие
	 * @param key — ключ в Redis, например 'email:ivan@example.com'
	 * @param ttl — TTL в секундах
	 */
	async check(key: string, ttl: number = RATE_LIMIT_TTL): Promise<void> {
		const lastSentStr = await this.redisService.get(key);

		if (!lastSentStr) {
			await this.redisService.setex(key, ttl, Date.now().toString());
			return;
		}

		const lastSent = parseInt(lastSentStr, 10);
		const now = Date.now();
		const diff = now - lastSent;

		if (diff < ttl * 1000) {
			const secondsLeft = Math.ceil((ttl * 1000 - diff) / 1000);
			throw new BadRequestException(`Подождите ${secondsLeft} секунд(ы)`);
		}

		await this.redisService.setex(key, ttl, now.toString());
	}
}
