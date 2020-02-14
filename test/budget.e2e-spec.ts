import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { generate, isValid } from 'shortid';
import { createTestApp, TestApp } from './utility';
import { Budget } from '../src/components/budget/budget';
import { createBudget } from './utility/create-budget';
import { createSession } from './utility/create-session';
import { createUser } from './utility/create-user';
import { fragments } from './utility/fragments';
import { gql } from 'apollo-server-core';
import { BudgetStatus } from '../src/components/budget/budget';

describe('budget e2e', () => {
  let app: TestApp;

  beforeAll(async () => {
    app = await createTestApp();
    await createSession(app);
    await createUser(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('create a budget', async () => {
    const budget = await createBudget(app);

    expect(budget.id).toBeDefined();
  });

  it('read one budget by id', async () => {
    const budget = await createBudget(app);

    try {
      const { budget: actual } = await app.graphql.query(
        gql`
          query budget($id: ID!) {
            budget(id: $id) {
              ...budget
            }
          }
          ${fragments.budget}
        `,
        {
          id: budget.id,
        },
      );

      expect(actual.id).toBe(budget.id);
      expect(isValid(actual.id)).toBeTruthy();

      expect(actual.status.value).toEqual(budget.status);
    } catch (e) {
      console.error(e);
    }
  });

  // UPDATE Project
  it.skip('update budget', async () => {
    const budget = await createBudget(app);
    const newStatus = BudgetStatus.Current;

    const result = await app.graphql.mutate(
      gql`
        mutation updateBudget($input: UpdateBudgetInput!) {
          updateBudget(input: $input) {
            budget {
              ...budget
            }
          }
        }
        ${fragments.budget}
      `,
      {
        input: {
          budget: {
            id: budget.id,
            name: newStatus,
          },
        },
      },
    );
    const updated = result?.updateBudget?.budget;
    expect(updated).toBeTruthy();
    expect(updated.id).toBe(budget.id);
    expect(updated.name.value).toBe(newStatus);
  });

  // DELETE Project
  it('delete budget', async () => {
    const budget = await createBudget(app);

    const result = await app.graphql.mutate(
      gql`
        mutation deleteProject($id: ID!) {
          deleteProject(id: $id)
        }
      `,
      {
        id: budget.id,
      },
    );

    expect(result.deleteBudget).toBeTruthy();
    try {
      await app.graphql.query(
        gql`
          query budget($id: ID!) {
            budget(id: $id) {
              ...budget
            }
          }
          ${fragments.budget}
        `,
        {
          id: budget.id,
        },
      );
    } catch (e) {
      expect(e.response.statusCode).toBe(404);
    }
  });
});
