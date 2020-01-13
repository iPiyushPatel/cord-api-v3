import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { isValid } from 'shortid';
import { CreateLanguageInput } from '../src/components/language/language.dto';

describe('Language e2e', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('create language', () => {
    const langName = 'bestLangEver12345' + Date.now();
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        query: `
        mutation {
          createLanguage (input: { language: { name: "${langName}" } }){
            language{
            id
            name
            }
          }
        }
        `,
      })
      .expect(({ body }) => {
        const langId = body.data.createLanguage.language.id;
        expect(isValid(langId)).toBe(true);
        expect(body.data.createLanguage.language.name).toBe(langName);
      })
      .expect(200);
  });

  it('read one language by id', async () => {
    const newLang = new CreateLanguageInput();
    newLang.name = 'langNameForReadLangTest1' + Date.now();

    // create lang first
    let langId;
    await request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        query: `
        mutation {
          createLanguage (input: { language: { name: "${newLang.name}" } }){
            language{
            id
            name
            }
          }
        }
        `,
      })
      .expect(({ body }) => {
        langId = body.data.createLanguage.language.id;
      })
      .expect(200);

    // test reading new lang
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        query: `
        query {
          readLanguage ( input: { language: { id: "${langId}" } }){
            language{
            id
            name
            }
          }
        }
        `,
      })
      .expect(({ body }) => {
        expect(body.data.readLanguage.language.id).toBe(langId);
        expect(body.data.readLanguage.language.name).toBe(newLang.name);
      })
      .expect(200);
  });

  it('update language', async () => {
    const newLang = new CreateLanguageInput();
    newLang.name = 'langNameForUpdateLangTest1' + Date.now();

    // create lang first
    let langId;
    await request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        query: `
          mutation {
            createLanguage (input: { language: { name: "${newLang.name}" } }){
              language{
              id
              name
              }
            }
          }
          `,
      })
      .expect(({ body }) => {
        langId = body.data.createLanguage.language.id;
      })
      .expect(200);

    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        query: `
        mutation {
          updateLanguage (input: { language: {id: "${langId}", name: "${newLang.name}" } }){
            language {
            id
            name
            }
          }
        }
        `,
      })
      .expect(({ body }) => {
        expect(body.data.updateLanguage.language.id).toBe(langId);
        expect(body.data.updateLanguage.language.name).toBe(newLang.name);
      })
      .expect(200);
  });

  it('delete language', async () => {
    const newLang = new CreateLanguageInput();
    newLang.name = 'langNameForDeleteLangTest1' + Date.now();

    // create lang first
    let langId;
    await request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        query: `
              mutation {
                createLanguage (input: { language: { name: "${newLang.name}" } }){
                  language{
                  id
                  name
                  }
                }
              }
              `,
      })
      .expect(({ body }) => {
        langId = body.data.createLanguage.language.id;
      })
      .expect(200);

    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        query: `
        mutation {
          deleteLanguage (input: { language: { id: "${langId}" } }){
            language {
            id
            }
          }
        }
        `,
      })
      .expect(({ body }) => {
        expect(body.data.deleteLanguage.language.id).toBe(langId);
      })
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
