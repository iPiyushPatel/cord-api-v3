import { InputType, ObjectType } from 'type-graphql';
import {
  Order,
  SecuredList,
  SortablePaginationInput,
} from '../../../../common';

import { BudgetRecord } from './budget-record.dto';

@InputType()
export class BudgetRecordListInput extends SortablePaginationInput<
  keyof BudgetRecord
>({
  defaultSort: 'fiscalYear',
  defaultOrder: Order.DESC,
}) {
  static defaultVal = new BudgetRecordListInput();
}

@ObjectType({
  description: SecuredList.descriptionFor('unavailabilities'),
})
export abstract class SecuredBudgetRecordList extends SecuredList(
  BudgetRecord,
) {}
