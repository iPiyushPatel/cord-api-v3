import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService, PropertyUpdaterService } from '../../core';
import {
  UpdateProductInput,
  UpdateProductOutputDto,
} from './product.dto';
import { generate } from 'shortid';
import { ISession } from '../auth';
import { Product, CreateProduct } from './dto';

@Injectable()
export class ProductService {
  constructor(
    private readonly db: DatabaseService,
    private readonly propertyUpdater: PropertyUpdaterService,
  ) {}


  async create(input: CreateProduct, session: ISession): Promise<Product> {
    const result = await this.db
      .query()
      .raw(
        `
        MATCH
          (token:Token {
            active: true,
            value: $token
          })
          <-[:token {active: true}]-
          (user:User {
            active: true,
            canCreateProduct: true
          })
        CREATE
          (prod:Product {
            id: $id,
            active: true,
            createdAt: datetime(),
            owningOrgId: "Seed Company"
          })
          -[:type {active: true}]->
          (type:ProductType {
            active: true,
            value: $type
          }),
          (prod)-[:books {active: true}]->(books:[BibleBooks] {
            active: true,
            value: $books
          }),
          (prod)-[:mediums {active: true}]->(mediums:[ProductMedium] {
            active: true,
            value: $mediums
          }),
          (prod)-[:purposes {active: true}]->(purposes:[ProductPurpose] {
            active: true,
            value: $purposes
          }),
          (prod)-[:approach {active: true}]->(approach:ProductApproach {
            active: true,
            value: $approach
          }),
          (prod)-[:methodology {active: true}]->(methodology:ProductMethodology {
            active: true,
            value: $methodology
          }),
          (user)
          <-[:member]-
          (acl:ACL {
            canReadType: true,
            canEditType: true,
            canReadBooks: true,
            canEditBooks: true,
            canReadMediums: true,
            canEditMediums: true,
            canReadPurposes: true,
            canEditPurposes: true,
            canReadApproach: true,
            canEditApproach: true,
            canReadMethodology: true,
            canEditMethodology: true
          })
          -[:toNode]->(prod)
        RETURN
          product.id as id,
          product.type as type,
          product.books as books,
          product.mediums as mediums,
          product.purposes as purposes,
          product.approach as approach,
          product.methodology as methodology
        `,
        {
          token: session.token,
          id: generate(),
          type: input.type,
          books: input.books,
          mediums: input.mediums,
          purposes: input.purposes,
          approach: input.approach,
          methodology: input.methodology,
        },
      )
      .first();

      if (!result) {
      throw new Error('Could not create product');
    }

    return {
      id: result.id,
      type: result.type,
      books: result.books,
      mediums: result.mediums,
      purposes: result.purposes,
      approach: result.approach,
      methodology: result.methodology,
      createdAt: result.createdAt,
      // degree: {
      //   value: result.degree,
      //   canRead: result.canReadDegree,
      //   canEdit: result.canEditDegree,
      // },
      // major: {
      //   value: result.major,
      //   canRead: result.canReadMajor,
      //   canEdit: result.canEditMajor,
      // },
      // institution: {
      //   value: result.institution,
      //   canRead: result.canReadInstitution,
      //   canEdit: result.canEditInstitution,
      // },
    };
  }

  // async create(input: CreateProduct, session: ISession): Promise<Product> {
  //   const id = generate();
  //   const acls = {
  //     canReadType: true,
  //     canEditType: true,
  //   };

  //   try {
  //     await this.propertyUpdater.createNode({
  //       session,
  //       input: { id, ...input },
  //       acls,
  //       baseNodeLabel: 'Product',
  //     });
  //   } catch (e) {
  //     console.log(e);
  //     throw new Error('Could not create product');
  //   }

  //   return await this.readOne(id);

  //   const response = new CreateProductOutputDto();
  //   const session = this.db.driver.session();
  //   const id = generate();
  //   await session
  //     .run(
  //       `
  //         MERGE
  //           (product:Product {active: true, owningOrg: "seedcompany", id: $id})
  //         ON CREATE SET
  //           product.id = $id,
  //           product.type  = $type,
  //           product.books=$books,
  //           product.mediums = $mediums,
  //           product.purposes=$purposes,
  //           product.approach=$approach,
  //           product.methodology=$methodology,
  //           product.timestamp = datetime()
  //         RETURN
  //           product.id as id,
  //           product.type as type,
  //           product.books as books,
  //           product.mediums as mediums,
  //           product.purposes as purposes,
  //           product.approach as approach,
  //           product.methodology as methodology
  //         `,
  //       {
  //         id,
  //         type: input.type,
  //         books: input.books,
  //         mediums: input.mediums,
  //         purposes: input.purposes,
  //         approach: input.approach,
  //         methodology: input.methodology,
  //       },
  //     )
  //     .then(result => {
  //       response.product.id = result.records[0].get('id');
  //       response.product.type = result.records[0].get('type');
  //       response.product.books = result.records[0].get('books');
  //       response.product.mediums = result.records[0].get('mediums');
  //       response.product.purposes = result.records[0].get('purposes');
  //       response.product.approach = result.records[0].get('approach');
  //       response.product.methodology = result.records[0].get('methodology');
  //     })
  //     .catch(error => {
  //       console.log(error);
  //     })
  //     .then(() => session.close());

  //   return response;
  // }

  async readOne(id: string): Promise<Product> {
    const result = await this.db
      .query()
      .raw(
        `
        MATCH
          (product:Product {active: true, owningOrg: "seedcompany"})
        WHERE
          product.id = $id
        RETURN
          product.id as id,
          product.type as type,
          product.books as books,
          product.mediums as mediums,
          product.purposes as purposes,
          product.approach as approach,
          product.methodology as methodology,
          product.createdAt as createdAt
        `,
        {
          id,
        },
      )
      .first();

      return {
        id: result.id,
        type: result.type,
        books: result.books,
        mediums: result.mediums,
        purposes: result.purposes,
        approach: result.approach,
        methodology: result.methodology,
        createdAt: result.createdAt,
      }
  }

  async update(input: UpdateProductInput): Promise<UpdateProductOutputDto> {
    const response = new UpdateProductOutputDto();
    const session = this.db.driver.session();
    await session
      .run(
        `MATCH (product:Product {active: true, owningOrg: "seedcompany", id: $id}) SET product.type = $type  RETURN product.id as id, product.type as type,product.books as books, product.mediums as mediums,product.purposes as purposes,product.approach as approach, product.methodology as methodology`,
        {
          id: input.id,
          type: input.type,
          books: input.books,
          mediums: input.mediums,
          purposes: input.purposes,
          approach: input.approach,
          methodology: input.methodology,
        },
      )
      .then(result => {
        if (result.records.length > 0) {
          response.product.id = result.records[0].get('id');
          response.product.type = result.records[0].get('type');
          response.product.books = result.records[0].get('books');
          response.product.mediums = result.records[0].get('mediums');
          response.product.purposes = result.records[0].get('purposes');
          response.product.approach = result.records[0].get('approach');
          response.product.methodology = result.records[0].get('methodology');
        } else {
          response.product = null;
        }
      })
      .catch(error => {
        console.log(error);
      })
      .then(() => session.close());

    return response;
  }

  async delete(id: string, session: ISession): Promise<void> {
    const object = await this.readOne(id);

    if (!object) {
      throw new NotFoundException('Could not find language');
    }

    try {
      await this.propertyUpdater.deleteNode({
        session,
        object,
        aclEditProp: 'canDeleteOwnUser',
      });
    } catch (e) {
      console.log(e);
      throw e;
    }
    // const response = new DeleteProductOutputDto();
    // const session = this.db.driver.session();
    // await session
    //   .run(
    //     'MATCH (product:Product {active: true, owningOrg: "seedcompany", id: $id}) SET product.active = false RETURN product.id as id',
    //     {
    //       id: input.id,
    //     },
    //   )
    //   .then(result => {
    //     response.product.id = result.records[0].get('id');
    //   })
    //   .catch(error => {
    //     console.log(error);
    //   })
    //   .then(() => session.close());

    // return response;
  }
}
