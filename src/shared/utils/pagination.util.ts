import { PaginationInput } from '../inputs/pagination.input';
import { Pagination } from '../models/pagination.model';

export function calculatePagination(
	paginationInput: PaginationInput,
	totalItems: number
): Pagination {
	const { page, limit } = paginationInput;
	const totalPages = Math.ceil(totalItems / limit);

	return {
		page,
		limit,
		total: totalItems,
		totalPages,
		hasNext: page < totalPages,
		hasPrevious: page > 1
	};
}
