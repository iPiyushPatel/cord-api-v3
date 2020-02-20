import {
  Field,
  ID,
  InputType,
  ObjectType,
  registerEnumType,
} from 'type-graphql';

import { Organization } from '../organization';
import { Resource } from '../../common';

@ObjectType({
  implements: Resource,
})
export class Budget {
  @Field(() => ID)
  id: string;

  @Field(type => BudgetStatus)
  status: BudgetStatus;

  @Field(type => [BudgetEntry])
  records: BudgetRecords[];
}

@ObjectType()
@InputType('BudgetRecordInput')
export class BudgetRecord {
  @Field(() => ID)
  id: string;

  @Field()
  organization: Organization;

  @Field({ nullable: true })
  fiscalYear: number;

  @Field({ nullable: true })
  amount: number;
}

export enum BudgetStatus {
  Pending = 'pending',
  Current = 'current',
  Superceded = 'superceded',
  Rejected = 'rejected',
}

registerEnumType(BudgetStatus, { name: 'BudgetStatus' });

// 1) initialize a pending - with records pre-made, with FY and financial partners and create the relationship to the project
// 2) current - immutable when project is active
// 3) superceded is an action
// 4)  CRUD record, update only the amount
// 5) Update Budget, update the status,
