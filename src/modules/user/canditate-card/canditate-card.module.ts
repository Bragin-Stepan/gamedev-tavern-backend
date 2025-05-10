import { Module } from '@nestjs/common';

import { CandidateCardResolver } from './canditate-card.resolver';
import { CandidateCardService } from './canditate-card.service';

@Module({
	providers: [CandidateCardResolver, CandidateCardService]
})
export class CandidateCardModule {}
