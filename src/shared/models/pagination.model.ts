import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Pagination {
	@Field(() => Number)
	page: number;

	@Field(() => Number)
	limit: number;

	@Field(() => Number)
	total: number;

	@Field(() => Number)
	totalPages: number;

	@Field(() => Boolean)
	hasNext: boolean;

	@Field(() => Boolean)
	hasPrevious: boolean;
}
