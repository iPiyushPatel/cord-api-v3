import {
  CreateBudget,
  CreateBudgetInput,
  CreateBudgetInputDto,
  CreateBudgetOutputDto,
  DeleteBudgetInput,
  DeleteBudgetInputDto,
  DeleteBudgetOutputDto,
  ReadBudgetInput,
  ReadBudgetInputDto,
  ReadBudgetOutputDto,
  UpdateBudgetInput,
  UpdateBudgetInputDto,
  UpdateBudgetOutputDto,
} from './dto';

import { Budget } from './budget';
import { DatabaseService, Logger, ILogger } from '../../core';
import { Injectable } from '@nestjs/common';
import { PropertyUpdaterService } from '../../core/database/property-updater.service';
import { generate } from 'shortid';
import { ISession } from '../auth';

@Injectable()
export class BudgetService {
  constructor(
    private readonly db: DatabaseService,
    private readonly propertyUpdater: PropertyUpdaterService,
    @Logger('user:service') private readonly logger: ILogger,
  ) {}

  async create(input: CreateBudget, session: ISession): Promise<Budget> {
    this.logger.info(
      `Mutation create budget by ${session.userId}`,
    );
    const id = generate();
    const result = await this.db
      .query()
      .raw(
        'MERGE (budget:Budget {active: true, owningOrg: "seedcompany", id: $id}) ON CREATE SET budget.id = $id, budget.status  = $status, budget.timestamp = datetime() RETURN budget.id as id, budget.status as status, budget.budgetDetails as budgetDetails',
        {
          id,
          status: input.status,
          budgetDetails: input.budgetDetails,
        },
      )
      .first();

    if (!result) {
      this.logger.error(
        `Could not create budget by ${session.userId}`,
      );
      throw new Error('Could not create language');
    }

    return {
      id: result.id,
      status: result.status,
      budgetDetails: result.budgetDetails,
    };
  }
  async readOne(input: ReadBudgetInput): Promise<ReadBudgetOutputDto> {
    const response = new ReadBudgetOutputDto();
    const session = this.db.driver.session();
    await session
      .run(
        `MATCH (budget:Budget {active: true, owningOrg: "seedcompany"}) WHERE budget.id = "${input.id}" RETURN budget.id as id, budget.status as status`,
        {
          id: input.id,
        },
      )
      .then(result => {
        response.budget.id = result.records[0].get('id');
        response.budget.status = result.records[0].get('status');
      })
      .catch(error => {
        console.log(error);
      })
      .then(() => session.close());

    return response;
  }

  async update(input: UpdateBudgetInput): Promise<UpdateBudgetOutputDto> {
    const response = new UpdateBudgetOutputDto();
    const session = this.db.driver.session();
    await session
      .run(
        `MATCH (budget:Budget {active: true, owningOrg: "seedcompany", id: $id}) SET budget.status = $status  RETURN budget.id as id,budget.status as status`,
        {
          id: input.id,
          status: input.status,
        },
      )
      .then(result => {
        if (result.records.length > 0) {
          response.budget.id = result.records[0].get('id');
          response.budget.status = result.records[0].get('status');
        } else {
          response.budget = null;
        }
      })
      .catch(error => {
        console.log(error);
      })
      .then(() => session.close());

    return response;
  }

  async delete(input: DeleteBudgetInput): Promise<DeleteBudgetOutputDto> {
    const response = new DeleteBudgetOutputDto();
    const session = this.db.driver.session();
    await session
      .run(
        'MATCH (budget:Budget {active: true, owningOrg: "seedcompany", id: $id}) SET budget.active = false RETURN budget.id as id',
        {
          id: input.id,
        },
      )
      .then(result => {
        response.budget.id = result.records[0].get('id');
      })
      .catch(error => {
        console.log(error);
      })
      .then(() => session.close());

    return response;
  }
}
