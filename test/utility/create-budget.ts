import * as faker from 'faker';

import { CreateBudgetInput } from '../../src/components/budget/budget.dto';
import {
  Budget,
  BudgetStatus,
  BudgetDetails,
} from '../../src/components/budget/budget';
import { TestApp } from './create-app';
import { fragments } from './fragments';
import { gql } from 'apollo-server-core';
import { isValid } from 'shortid';
import { Organization } from 'src/components/organization';

export async function createBudget(
  app: TestApp,
  input: Partial<CreateBudgetInput> = {},
) {
  console.log('k...');
  const budget: CreateBudgetInput = {
    status: BudgetStatus.Pending,
    budgetDetails: BudgetDetails[0],
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
          ...budget,
        },
      },
    },
  );

  const actual: Budget | undefined = result.createBudget?.budget;
  expect(actual).toBeTruthy();
  console.log('actualk', actual);
  expect(isValid(actual.id)).toBe(true);
  expect(actual.status).toBe(budget.status);

  return actual;
}
