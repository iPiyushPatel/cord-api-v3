import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { IdArg } from '../../../common';
import { ISession, Session } from '../../auth';
import {
  CreateBudgetRecordInput,
  CreateBudgetRecordOutput,
  UpdateBudgetRecordInput,
  UpdateBudgetRecordOutput,
  BudgetRecordListInput,
  SecuredBudgetRecordList,
  BudgetRecord,
} from './dto';
import { BudgetRecordService } from './budget-record.service';

@Resolver()
export class BudgetRecordResolver {
  constructor(private readonly service: BudgetRecordService) {}

  @Query(() => BudgetRecord, {
    description: 'Look up a budget record by its ID',
  })
  async budgetRecord(
    @Session() session: ISession,
    @IdArg() id: string,
  ): Promise<BudgetRecord> {
    return await this.service.readOne(id, session);
  }

  // @Query(() => SecuredBudgetRecordList, {
  //   description: 'Look up budgetRecords for a user',
  // })
  // async budgetRecords(
  //   @RequestUser() token: IRequestUser,
  //   @Args({
  //     userId: 'id',
  //     type: () => BudgetRecordListInput,
  //     defaultValue: BudgetRecordListInput.defaultVal,
  //   })
  //   input: BudgetRecordListInput,
  // ): Promise<SecuredBudgetRecordList> {
  //   return this.service.list(userId, input, token);
  // }

  @Mutation(() => CreateBudgetRecordOutput, {
    description: 'Create an budget record',
  })
  async createBudgetRecord(
    @Session() session: ISession,
    @Args('input') { budgetRecord: input }: CreateBudgetRecordInput,
  ): Promise<CreateBudgetRecordOutput> {
    const budgetRecord = await this.service.create(input, session);
    return { budgetRecord };
  }

  @Mutation(() => UpdateBudgetRecordOutput, {
    description: 'Update an budget record',
  })
  async updateBudgetRecord(
    @Session() session: ISession,
    @Args('input') { budgetRecord: input }: UpdateBudgetRecordInput,
  ): Promise<UpdateBudgetRecordOutput> {
    const budgetRecord = await this.service.update(input, session);
    return { budgetRecord };
  }

  @Mutation(() => Boolean, {
    description: 'Delete an budget record',
  })
  async deleteBudgetRecord(
    @Session() session: ISession,
    @IdArg() id: string,
  ): Promise<boolean> {
    await this.service.delete(id, session);
    return true;
  }
}
