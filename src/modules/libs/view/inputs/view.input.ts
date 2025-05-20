import { Field, ID, InputType, registerEnumType } from '@nestjs/graphql';
import { TargetContentType } from '@prisma/generated';

registerEnumType(TargetContentType, {
	name: 'TargetContentType'
});

@InputType()
export class ViewInput {
	@Field(() => TargetContentType)
	targetContentType: TargetContentType;

	@Field(() => ID)
	targetId: string;
}
