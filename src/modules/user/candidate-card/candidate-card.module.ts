import { Module } from '@nestjs/common';

import { CandidateCardResolver } from './candidate-card.resolver';
import { CandidateCardService } from './candidate-card.service';

@Module({
	providers: [CandidateCardResolver, CandidateCardService]
})
export class CandidateCardModule {}
