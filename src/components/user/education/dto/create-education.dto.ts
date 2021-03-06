import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { Field, ID, InputType, ObjectType } from 'type-graphql';
import { Degree, Education } from './education.dto';

@InputType()
export class CreateEducation {
  @Field(() => ID)
  readonly userId: string;

  @Field()
  readonly degree: Degree;

  @Field()
  readonly major: string;

  @Field()
  readonly institution: string;
}

@InputType()
export abstract class CreateEducationInput {
  @Field()
  @Type(() => CreateEducation)
  @ValidateNested()
  readonly education: CreateEducation;
}

@ObjectType()
export abstract class CreateEducationOutput {
  @Field()
  readonly education: Education;
}
