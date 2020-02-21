import { BudgetRecordResolver } from './budget-record.resolver';
import { BudgetRecordService } from './budget-record.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [
    BudgetRecordResolver,
    BudgetRecordService,
  ],
  exports: [
    BudgetRecordService,
  ],
})
export class BudgetRecordModule {}
