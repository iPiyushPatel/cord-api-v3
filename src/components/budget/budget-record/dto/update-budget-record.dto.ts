import { Field, ID, InputType, ObjectType } from 'type-graphql';

import { BudgetRecord } from './budget-record.dto';
import { DateTime } from 'luxon';
import { DateTimeField } from '../../../../common';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

@InputType()
export abstract class UpdateBudgetRecord {
  @Field(() => ID)
  readonly id: string;

  @Field({ nullable: true })
  readonly description?: string;

  @DateTimeField({ nullable: true })
  readonly start?: DateTime;

  @DateTimeField({ nullable: true })
  readonly end?: DateTime;
}

@InputType()
export abstract class UpdateBudgetRecordInput {
  @Field()
  @Type(() => UpdateBudgetRecord)
  @ValidateNested()
  readonly budgetRecord: UpdateBudgetRecord;
}

@ObjectType()
export abstract class UpdateBudgetRecordOutput {
  @Field()
  readonly budgetRecord: BudgetRecord;
}
