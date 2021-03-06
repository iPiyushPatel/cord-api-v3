import { Injectable, NotFoundException } from '@nestjs/common';
import { Connection } from 'cypher-query-builder';
import { generate } from 'shortid';
import { ILogger, Logger } from '../../../core/logger';
import { PropertyUpdaterService } from '../../../core';
import { ISession } from '../../auth';
import {
  CreateEducation,
  SecuredEducationList,
  Education,
  EducationListInput,
  UpdateEducation,
} from './dto';

@Injectable()
export class EducationService {
  constructor(
    private readonly db: Connection,
    @Logger('EducationService:service') private readonly logger: ILogger,
    private readonly propertyUpdater: PropertyUpdaterService,
  ) {}

  async list(
    educationId: string,
    input: EducationListInput,
    token: string,
  ): Promise<SecuredEducationList> {
    this.logger.info('Listing educations', { input, token });
    throw new Error('Not implemented');
  }

  async create(input: CreateEducation, session: ISession): Promise<Education> {
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
          (requestingUser:User {
            active: true,
            id: $requestingUserId
          }),
          (targetUser:User {
            active: true,
            id: $targetUserId
          })
        CREATE
          (targetUser)
          -[:education {active: true, createdAt: datetime()}]->
          (education:Education {
            active: true,
            createdAt: datetime(),
            id: $id,
            owningOrgId: $owningOrgId
          })
          -[:degree {active: true}]->
          (degree:Property {
            active: true,
            value: $degree
          }),
          (education)-[:major {active: true, createdAt: datetime()}]->
          (major:Property {
            active: true,
            value: $major
          }),
          (education)-[:institution {active: true, createdAt: datetime()}]->
          (institution:Property {
            active: true,
            value: $institution
          }),
          (requestingUser)
          <-[:member]-
          (acl:ACL {
            canReadDegree: true,
            canEditDegree: true,
            canReadMajor: true,
            canEditMajor: true,
            canReadInstitution: true,
            canEditInstitution: true
          })
          -[:toNode]->
          (education)
        RETURN
          education.id as id,
          education.createdAt as createdAt,
          degree.value as degree,
          acl.canReadDegree as canReadDegree,
          acl.canEditDegree as canEditDegree,
          major.value as major,
          acl.canReadMajor as canReadMajor,
          acl.canEditMajor as canEditMajor,
          institution.value as institution,
          acl.canReadInstitution as canReadInstitution,
          acl.canEditInstitution as canEditInstitution
        `,
        {
          token: session.token,
          requestingUserId: session.userId,
          targetUserId: input.userId,
          degree: input.degree,
          major: input.major,
          institution: input.institution,
          id: generate(),
          owningOrgId: session.owningOrgId,
        },
      )
      .first();
    if (!result) {
      throw new Error('Could not create education');
    }

    return {
      id: result.id,
      createdAt: result.createdAt,
      degree: {
        value: result.degree,
        canRead: result.canReadDegree,
        canEdit: result.canEditDegree,
      },
      major: {
        value: result.major,
        canRead: result.canReadMajor,
        canEdit: result.canEditMajor,
      },
      institution: {
        value: result.institution,
        canRead: result.canReadInstitution,
        canEdit: result.canEditInstitution,
      },
    };
  }

  async readOne(id: string, session: ISession): Promise<Education> {
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
        (requestingUser:User {
          active: true,
          id: $requestingUserId,
          owningOrgId: $owningOrgId
        }),
        (education:Education {active: true, id: $id})
        WITH * OPTIONAL MATCH (requestingUser)<-[:member]-(acl1:ACL {canReadDegree: true})-[:toNode]->(education)-[:degree {active: true}]->(degree:Property {active: true})
        WITH * OPTIONAL MATCH (requestingUser)<-[:member]-(acl2:ACL {canEditDegree: true})-[:toNode]->(education)
        WITH * OPTIONAL MATCH (requestingUser)<-[:member]-(acl3:ACL {canReadMajor: true})-[:toNode]->(education)-[:major {active: true}]->(major:Property {active: true})
        WITH * OPTIONAL MATCH (requestingUser)<-[:member]-(acl4:ACL {canEditMajor: true})-[:toNode]->(education)
        WITH * OPTIONAL MATCH (requestingUser)<-[:member]-(acl5:ACL {canReadInstitution: true})-[:toNode]->(education)-[:institution {active: true}]->(institution:Property {active: true})
        WITH * OPTIONAL MATCH (requestingUser)<-[:member]-(acl6:ACL {canEditInstitution: true})-[:toNode]->(education)
        RETURN
          education.id as id,
          education.createdAt as createdAt,
          degree.value as degree,
          acl1.canReadDegree as canReadDegree,
          acl2.canEditDegree as canEditDegree,
          major.value as major,
          acl3.canReadMajor as canReadMajor,
          acl4.canEditMajor as canEditMajor,
          institution.value as institution,
          acl5.canReadInstitution as canReadInstitution,
          acl6.canEditInstitution as canEditInstitution
        `,
        {
          token: session.token,
          requestingUserId: session.userId,
          owningOrgId: session.owningOrgId,
          id,
        },
      )
      .first();
    if (!result) {
      throw new NotFoundException('Could not find education');
    }

    return {
      id,
      createdAt: result.createdAt,
      degree: {
        value: result.degree,
        canRead: result.canReadDegree !== null ? result.canReadDegree : false,
        canEdit: result.canEditDegree !== null ? result.canEditDegree : false,
      },
      major: {
        value: result.major,
        canRead: result.canReadMajor !== null ? result.canReadMajor : false,
        canEdit: result.canEditMajor !== null ? result.canEditMajor : false,
      },
      institution: {
        value: result.institution,
        canRead:
          result.canReadInstitution !== null
            ? result.canReadInstitution
            : false,
        canEdit:
          result.canEditInstitution !== null
            ? result.canEditInstitution
            : false,
      },
    };
  }

  async update(input: UpdateEducation, session: ISession): Promise<Education> {
    const ed = await this.readOne(input.id, session);

    return this.propertyUpdater.updateProperties({
      session,
      object: ed,
      props: ['degree', 'major', 'institution'],
      changes: input,
      nodevar: 'education',
    });
  }

  async delete(id: string, session: ISession): Promise<void> {
    const ed = await this.readOne(id, session);
    try {
      this.propertyUpdater.deleteNode({
        session,
        object: ed,
        aclEditProp: 'canDeleteOwnUser',
      });
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}
