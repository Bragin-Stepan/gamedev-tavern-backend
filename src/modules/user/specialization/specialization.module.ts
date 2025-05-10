import { Module } from '@nestjs/common';

import { SpecializationResolver } from './specialization.resolver';
import { SpecializationService } from './specialization.service';

@Module({
	providers: [SpecializationResolver, SpecializationService]
})
export class SpecializationModule {}
