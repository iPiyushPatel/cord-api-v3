import * as faker from 'faker';
import { CreateProjectInput } from '../../src/components/project/project.dto';
import { Project } from '../../src/components/project/project';
import { TestApp } from './create-app';
import { fragments } from './fragments';
import { gql } from 'apollo-server-core';
import { isValid } from 'shortid';
import { ProjectStatus } from '../../src/components/project/status';
import { Sensitivity } from '../../src/components/project/sensitivity';
import { DateTime } from 'luxon';

export async function createProject(
  app: TestApp,
  input: Partial<CreateProjectInput> = {},
) {
  const project: CreateProjectInput = {
    name: 'seed',
    deptId: 'abc123',
    status: ProjectStatus.EarlyConversations,
    locationId: null,
    mouStart: DateTime.local(2017, 5, 15, 8, 30),
    mouEnd: DateTime.local(2017, 5, 15, 8, 30),
    partnerships: [],
    sensitivity: Sensitivity.Low,
    team: [],
    budgets: [],
    estimatedSubmission: DateTime.local(2017, 5, 15, 8, 30),
    engagements: [],

    ...input,
  };

  const result = await app.graphql.mutate(
    gql`
      mutation createProject($input: CreateProjectInput!) {
        createProject(input: $input) {
          project {
            ...project
          }
        }
      }
      ${fragments.project}
    `,
    {
      input: {
        project: {
          ...project,
        },
      },
    },
  );

  const actual: Project | undefined = result.createProject?.project;
  expect(actual).toBeTruthy();

  expect(isValid(actual.id)).toBe(true);
  expect(actual.name).toBe(project.name);

  return actual;
}
