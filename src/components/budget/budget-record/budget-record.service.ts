import { Injectable, NotFoundException } from '@nestjs/common';
import { Connection } from 'cypher-query-builder';
import { DateTime } from 'luxon';
import { generate } from 'shortid';
import { ILogger, Logger, PropertyUpdaterService } from '../../../core';
import { ISession } from '../../auth';
import {
  CreateBudgetRecord,
  SecuredBudgetRecordList,
  BudgetRecord,
  BudgetRecordListInput,
  UpdateBudgetRecord,
} from './dto';

@Injectable()
export class BudgetRecordService {
  constructor(
    private readonly db: Connection,
    @Logger('BudgetRecordService:service') private readonly logger: ILogger,
    private readonly propertyUpdater: PropertyUpdaterService,
  ) {}

  async create(
    input: CreateBudgetRecord,
    session: ISession,
  ): Promise<BudgetRecord> {
    const id = generate();
    const acls = {
      canReadDescription: true,
      canEditDescription: true,
      canReadStart: true,
      canEditStart: true,
      canReadEnd: true,
      canEditEnd: true,
    };
    try {
      await this.propertyUpdater.createNode({
        session,
        input: { id, ...input },
        acls,
        baseNodeLabel: 'BudgetRecord',
        aclEditProp: 'canCreateBudgetRecord',
      });
    } catch {
      this.logger.error(
        `Could not create budget record for project ${input.projectId}`,
      );
      throw new Error('Could not create budget record');
    }

    this.logger.info(
      `budget record for project ${input.projectId} created, id ${id}`,
    );
    console.log(
      `budget record for project ${input.projectId} created, id ${id}`,
    );

    // connect the BudgetRecord to the Budget.

    const query1 = //TODO
    `
    
    `;
    const result1 = await this.db
      .query()
      .raw(query1, {
        userId: session.userId,
        id,
      })
      .first();
    console.log(result1);

    // connect the BudgetRecord to the Organization.

    const query2 = //TODO
    `
    
    `;
    const result2 = await this.db
      .query()
      .raw(query2, {
        userId: session.userId,
        id,
      })
      .first();
    console.log(result2);

    
    return await this.readOne(id, session);
  }

  async readOne(id: string, session: ISession): Promise<BudgetRecord> {
    this.logger.info(
      `Query readOne BudgetRecord: id ${id} by ${session.userId}`,
    );
    const result = await this.db
      .query()
      .raw(
        // TODO
        `
      
      `,
        {
          id,
          token: session.token,
          requestingUserId: session.userId,
        },
      )
      .first();

    if (!result) {
      this.logger.error(`Could not find budgetRecord: ${id} `);
      throw new NotFoundException(`Could not find budgetRecord ${id}`);
    }

    if (!result.canReadBudgetRecord) {
      throw new Error(
        'User does not have permission to read these unavailabilities',
      );
    }
    return {
      id: result.id,
      createdAt: DateTime.local(), // TODO
      organization: {
        value: result.organization,
        canRead: result.canReadDescription,
        canEdit: result.canEditDescription,
      },
      fiscalYear: {
        value: result.fiscalYear,
        canRead: result.canReadStart,
        canEdit: result.canEditStart,
      },
      amount: {
        value: result.amount,
        canRead: result.canReadEnd,
        canEdit: result.canEditEnd,
      },
    };
  }

  async update(
    input: UpdateBudgetRecord,
    session: ISession,
  ): Promise<BudgetRecord> {
    const budgetRecord = await this.readOne(input.id, session);

    return this.propertyUpdater.updateProperties({
      session,
      object: budgetRecord,
      props: ['organization', 'fiscalYear', 'amount'],
      changes: input,
      nodevar: 'budgetRecord',
    });
  }

  async delete(id: string, session: ISession): Promise<void> {
    this.logger.info(
      `mutation delete budget record: ${id} by ${session.userId}`,
    );
    const ua = await this.readOne(id, session);
    if (!ua) {
      throw new NotFoundException('BudgetRecord not found');
    }
    try {
      this.propertyUpdater.deleteNode({
        session,
        object: br,
        aclEditProp: 'canEditBudget',
      });
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async list(
    userId: string,
    input: BudgetRecordListInput,
    session: ISession,
  ): Promise<SecuredBudgetRecordList> {
    throw new Error('Not implemented');
  }
}
