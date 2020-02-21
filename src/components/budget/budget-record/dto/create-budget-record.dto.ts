import { Field, ID, InputType, ObjectType } from 'type-graphql';

import { BudgetRecord } from './budget-record.dto';
import { DateTime } from 'luxon';
import { DateTimeField } from '../../../../common';
import { Organization } from '../../../organization';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

@InputType()
export class CreateBudgetRecord {
  @Field()
  organization: Organization;

  @Field({ nullable: true })
  fiscalYear: number;

  @Field({ nullable: true })
  amount: number;
}

@InputType()
export abstract class CreateBudgetRecordInput {
  @Field()
  @Type(() => CreateBudgetRecord)
  @ValidateNested()
  readonly budgetRecord: CreateBudgetRecord;
}

@ObjectType()
export abstract class CreateBudgetRecordOutput {
  @Field()
  readonly budgetRecord: BudgetRecord;
}
