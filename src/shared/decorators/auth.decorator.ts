import { applyDecorators, UseGuards } from '@nestjs/common';

import { RoleType } from '@/prisma/generated';

import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

export function Authorization(...roles: RoleType[]) {
	return applyDecorators(UseGuards(GqlAuthGuard, new RolesGuard(roles)));
}
