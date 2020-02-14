import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { isValid, generate } from 'shortid';
import { createTestApp, TestApp } from './utility';
import { createProject } from './utility/create-project';
import { createSession } from './utility/create-session';
import { createUser } from './utility/create-user';
import { fragments } from './utility/fragments';
import { gql } from 'apollo-server-core';

describe('Project e2e', () => {
  let app: TestApp;

  beforeAll(async () => {
    app = await createTestApp();
    await createSession(app);
    await createUser(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('create a project', async () => {
    const project = await createProject(app);

    expect(project.id).toBeDefined();
  });

  it('read one project by id', async () => {
    const project = await createProject(app);

    try {
      const { project: actual } = await app.graphql.query(
        gql`
          query project($id: ID!) {
            project(id: $id) {
              ...project
            }
          }
          ${fragments.project}
        `,
        {
          id: project.id,
        },
      );
      expect(actual.id).toBe(project.id);
      expect(isValid(actual.id)).toBeTruthy();

      expect(actual.name.value).toEqual(project.name);
    } catch (e) {
      console.error(e);
    }
  });

  // UPDATE Project
  it.skip('update project', async () => {
    const project = await createProject(app);
    const newName = 'olive';

    const result = await app.graphql.mutate(
      gql`
        mutation updateLanguage($input: UpdateLanguageInput!) {
          updateProject(input: $input) {
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
            id: project.id,
            name: newName,
          },
        },
      },
    );
    const updated = result?.updateLanguage?.project;
    expect(updated).toBeTruthy();
    expect(updated.id).toBe(project.id);
    expect(updated.name.value).toBe(newName);
  });

  // DELETE Project
  it('delete project', async () => {
    const project = await createProject(app);

    const result = await app.graphql.mutate(
      gql`
        mutation deleteProject($id: ID!) {
          deleteProject(id: $id)
        }
      `,
      {
        id: project.id,
      },
    );

    expect(result.deleteProject).toBeTruthy();
    try {
      await app.graphql.query(
        gql`
          query project($id: ID!) {
            project(id: $id) {
              ...project
            }
          }
          ${fragments.project}
        `,
        {
          id: project.id,
        },
      );
    } catch (e) {
      expect(e.response.statusCode).toBe(404);
    }
  });
});
