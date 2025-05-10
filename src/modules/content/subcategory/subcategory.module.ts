import { Module } from '@nestjs/common';

import { SubcategoryResolver } from './subcategory.resolver';
import { SubcategoryService } from './subcategory.service';

@Module({
	providers: [SubcategoryResolver, SubcategoryService]
})
export class SubcategoryModule {}
