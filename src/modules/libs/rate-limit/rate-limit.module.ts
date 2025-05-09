import { Global, Module } from '@nestjs/common';

import { RedisService } from '@/src/core/redis/redis.service';

import { RateLimitService } from './rate-limit.service';

@Global()
@Module({
	providers: [RateLimitService, RedisService],
	exports: [RateLimitService]
})
export class RateLimitModule {}
