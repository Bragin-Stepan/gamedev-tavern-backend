import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { RoleType } from '@/prisma/generated';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private roles: RoleType[] = []) {}

	canActivate(context: ExecutionContext): boolean {
		const ctx = GqlExecutionContext.create(context);
		const user = ctx.getContext().req.user;

		if (!user) return false;

		if (!this.roles.length) return true;

		return this.roles.some(role => role === user.role);
	}
}
