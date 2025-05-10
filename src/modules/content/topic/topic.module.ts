import { Module } from '@nestjs/common';

import { ViewService } from '../../libs/view/view.service';

import { TopicResolver } from './topic.resolver';
import { TopicService } from './topic.service';

@Module({
	providers: [TopicResolver, TopicService, ViewService]
})
export class TopicModule {}
