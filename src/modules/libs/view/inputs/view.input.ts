import { Field, ID, InputType } from '@nestjs/graphql';
import { TargetContentType } from '@prisma/generated';

@InputType()
export class ViewInput {
	@Field(() => TargetContentType)
	targetContentType: TargetContentType;

	@Field(() => ID)
	targetId: string;
}
