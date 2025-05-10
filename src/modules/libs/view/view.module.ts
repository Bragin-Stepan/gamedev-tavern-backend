import { Global, Module } from '@nestjs/common';

import { ViewService } from './view.service';

@Global()
@Module({
	providers: [ViewService]
})
export class ViewModule {}
