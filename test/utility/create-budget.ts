import * as faker from 'faker';

import {
  Budget,
  BudgetDetails,
  BudgetStatus,
} from '../../src/components/budget/budget';

import { CreateBudget } from '../../src/components/budget/dto';
import { TestApp } from './create-app';
import { createOrganization } from './create-organization';
import { fragments } from './fragments';
import { gql } from 'apollo-server-core';
import { isValid } from 'shortid';

export async function createBudget(
  app: TestApp,
  input: Partial<CreateBudget> = {},
) {
  const budget: CreateBudget = {
    status: BudgetStatus.Pending,
    budgetDetails: [],
    ...input,
  };

  const result = await app.graphql.mutate(
    gql`
      mutation createBudget($input: CreateBudgetInput!) {
        createBudget(input: $input) {
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
          budget,
        },
      },
    },
  );

  const actual: Budget | undefined = result.createBudget?.budget;
  expect(actual).toBeTruthy();
  expect(isValid(actual.id)).toBe(true);
  expect(actual.status).toBe(budget.status);

  return actual;
}
