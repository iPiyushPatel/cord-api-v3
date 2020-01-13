import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { isValid } from 'shortid';
import { CreateUserInput } from '../src/components/user/user.dto';
import { DatabaseUtility } from '../src/common/database-utility';

describe('User e2e', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    const db: DatabaseUtility = app.get(DatabaseUtility);
    // await db.resetDatabaseForTesting();
  });

  it('create user', async () => {
    const userEmail = 'firstUser';

    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        query: `
        mutation {
          createUser (input: { user: { email: "${userEmail}" } }){
            user{
            id
            email
            }
          }
        }
        `,
      })
      .expect(({ body }) => {
        //console.log(body.data);
        const userId = body.data.createUser.user.id;
        expect(isValid(userId)).toBe(true);
        expect(body.data.createUser.user.email).toBe(userEmail);
      })
      .expect(200);
  });

  it('read one user by id', async () => {
    const newUser = new CreateUserInput();
    newUser.email = 'userEmailUserTest1';

    // create user first
    let userId;
    await request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        query: `
        mutation {
          createUser (input: { user: { email: "${newUser.email}" } }){
            user{
            id
            email
            }
          }
        }
        `,
      })
      .expect(({ body }) => {
        userId = body.data.createUser.user.id;
      })
      .expect(200);

    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        query: `
        query {
          readUser ( input: { user: { id: "${userId}" } }){
            user{
            id
            email
            }
          }
        }
        `,
      })
      .expect(({ body }) => {
        expect(body.data.readUser.user.id).toBe(userId);
        expect(body.data.readUser.user.email).toBe(newUser.email);
      })
      .expect(200);
  });

  it('update user', async () => {
    const newUser = new CreateUserInput();
    newUser.email = 'userEmailForUpdateUserTest1';

    let userId;
    await request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        query: `
        mutation {
          createUser (input: { user: { email: "${newUser.email}" } }){
            user{
            id
            email
            }
          }
        }
        `,
      })
      .expect(({ body }) => {
        userId = body.data.createUser.user.id;
      })
      .expect(200);

    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        query: `
        mutation {
          updateUser (input: { user: {id: "${userId}", email: "${newUser.email}" } }){
            user {
            id
            email
            }
          }
        }
        `,
      })
      .expect(({ body }) => {
        expect(body.data.updateUser.user.id).toBe(userId);
        expect(body.data.updateUser.user.email).toBe(newUser.email);
      })
      .expect(200);
  });

  it('delete user', async () => {
    const newUser = new CreateUserInput();
    newUser.email = 'userEmailForDeleteUserTest1';

    let userId;
    await request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        query: `
        mutation {
          createUser (input: { user: { email: "${newUser.email}" } }){
            user{
            id
            email
            }
          }
        }
        `,
      })
      .expect(({ body }) => {
        userId = body.data.createUser.user.id;
      })
      .expect(200);

    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        query: `
        mutation {
          deleteUser (input: { user: { id: "${userId}" } }){
            user {
            id
            }
          }
        }
        `,
      })
      .expect(({ body }) => {
        expect(body.data.deleteUser.user.id).toBe(userId);
      })
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});