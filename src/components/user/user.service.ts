import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Connection } from 'cypher-query-builder';
import { generate } from 'shortid';
import * as argon2 from 'argon2';
import { ILogger, Logger, OnIndex, PropertyUpdaterService } from '../../core';
import { ISession } from '../auth';
import {
  OrganizationListInput,
  SecuredOrganizationList,
  OrganizationService,
} from '../organization';
import {
  CreateUser,
  UpdateUser,
  User,
  UserListInput,
  UserListOutput,
} from './dto';

@Injectable()
export class UserService {
  constructor(
    private readonly organizations: OrganizationService,
    private readonly db: Connection,
    private readonly propertyUpdater: PropertyUpdaterService,
    @Logger('user:service') private readonly logger: ILogger,
  ) { }

  @OnIndex()
  async createIndexes() {
    // language=Cypher (for webstorm)
    const constraints = [
      // USER NODE
      'CREATE CONSTRAINT ON (n:User) ASSERT EXISTS(n.id)',
      'CREATE CONSTRAINT ON (n:User) ASSERT n.id IS UNIQUE',
      'CREATE CONSTRAINT ON (n:User) ASSERT EXISTS(n.active)',
      'CREATE CONSTRAINT ON (n:User) ASSERT EXISTS(n.createdAt)',
      'CREATE CONSTRAINT ON (n:User) ASSERT EXISTS(n.owningOrgId)',
      'CREATE CONSTRAINT ON (n:User) ASSERT EXISTS(n.owningOrgId)',

      // EMAIL REL
      'CREATE CONSTRAINT ON ()-[r:email]-() ASSERT EXISTS(r.active)',
      'CREATE CONSTRAINT ON ()-[r:email]-() ASSERT EXISTS(r.createdAt)',

      // EMAIL NODE
      'CREATE CONSTRAINT ON (n:EmailAddress) ASSERT EXISTS(n.value)',
      'CREATE CONSTRAINT ON (n:EmailAddress) ASSERT n.value IS UNIQUE',

      // PASSWORD REL
      'CREATE CONSTRAINT ON ()-[r:password]-() ASSERT EXISTS(r.active)',
      'CREATE CONSTRAINT ON ()-[r:password]-() ASSERT EXISTS(r.createdAt)',

      // PROPERTY NODE
      'CREATE CONSTRAINT ON (n:Property) ASSERT EXISTS(n.value)',
      'CREATE CONSTRAINT ON (n:Property) ASSERT EXISTS(n.active)',
    ];
    for (const query of constraints) {
      await this.db
        .query()
        .raw(query)
        .run();
    }
  }

  async list(
    { page, count, sort, order, filter }: UserListInput,
    session: ISession,
  ): Promise<UserListOutput> {
    // first we'll check if the user has permission to list all users for their org
    const permCheck = await this.db
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
          canReadUsers: true
        })
      RETURN
        requestingUser.canReadUsers as canReadUsers
    `,
        {
          token: session.token,
        },
      )
      .first();
    if (!permCheck?.canReadUsers) {
      throw new UnauthorizedException();
    }

    // now we'll get all users
    const result = await this.db
      .query()
      .raw(
        `
          MATCH
            (user:User {active: true, owningOrgId: $owningOrgId})
          WITH count(user) as total
          MATCH
            (user:User {active: true, owningOrgId: $owningOrgId}),
            (user)-[:email {active: true}]->(email:EmailAddress {active: true}),
            (user)-[:realFirstName {active: true}]->(realFirstName:Property {active: true}),
            (user)-[:realLastName {active: true}]->(realLastName:Property {active: true}),
            (user)-[:displayFirstName {active: true}]->(displayFirstName:Property {active: true}),
            (user)-[:displayLastName {active: true}]->(displayLastName:Property {active: true}),
            (user)-[:phone {active: true}]->(phone:Property {active: true}),
            (user)-[:timezone {active: true}]->(timezone:Property {active: true}),
            (user)-[:bio {active: true}]->(bio:Property {active: true})
        RETURN
          total,
          user.id as id,
          user.createdAt as createdAt,
          email.value as email,
          realFirstName.value as realFirstName,
          realLastName.value as realLastName,
          displayFirstName.value as displayFirstName,
          displayLastName.value as displayLastName,
          phone.value as phone,
          timezone.value as timezone,
          bio.value as bio
        ORDER BY ${sort} ${order}
        SKIP $skip
        LIMIT $count
        `,
        {
          // filter: filter.name, // TODO Handle no filter
          skip: (page - 1) * count,
          count,
          token: session.token,
          id: session.userId,
          owningOrgId: session.owningOrgId,
        },
      )
      .run();

    const items = result.map<User>(row => ({
      id: row.id,
      createdAt: row.createdAt,
      email: {
        value: row.email,
        canRead: true,
        canEdit: false,
      },
      realFirstName: {
        value: row.realFirstName,
        canRead: true,
        canEdit: false,
      },
      realLastName: {
        value: row.realLastName,
        canRead: true,
        canEdit: false,
      },
      displayFirstName: {
        value: row.displayFirstName,
        canRead: true,
        canEdit: false,
      },
      displayLastName: {
        value: row.displayLastName,
        canRead: true,
        canEdit: false,
      },
      phone: {
        value: row.phone,
        canRead: true,
        canEdit: false,
      },
      timezone: {
        value: row.timezone,
        canRead: true,
        canEdit: false,
      },
      bio: {
        value: row.bio,
        canRead: true,
        canEdit: false,
      },
    }));

    const hasMore = (page - 1) * count + count < result[0].total; // if skip + count is less than total there is more

    return {
      items,
      hasMore,
      total: result[0].total,
    };
  }

  async listOrganizations(
    userId: string,
    input: OrganizationListInput,
    session: ISession,
  ): Promise<SecuredOrganizationList> {
    // Just a thought, seemed like a good idea to try to reuse the logic/query there.
    const result = await this.organizations.list(
      {
        ...input,
        filter: {
          ...input.filter,
          userIds: [userId],
        },
      },
      session,
    );

    return {
      ...result,
      canRead: true, // TODO
      canCreate: true, // TODO
    };
  }

  async create(input: CreateUser, session: ISession): Promise<User> {
    const pash = await argon2.hash(input.password);
    /** CREATE USER
     * get the token, then create the user with minimum properties
     * create an ACL node and ensure the user can edit their own properties
     */
    const result = await this.db
      .query()
      .raw(
        `
        MATCH (token:Token {active: true, value: $token})
        CREATE
          (user:User {
            id: $id,
            active: true,
            createdAt: datetime(),
            createdByUserId: "system",
            canCreateOrg: true,
            canReadOrgs: true,
            canReadUsers: true,
            canCreateLang: true,
            canReadLangs: true,
            canCreateUnavailability: true,
            canReadUnavailability: true,
            canDeleteOwnUser: true,
            owningOrgId: "Seed Company",
            isAdmin: true
          })
          -[:email {active: true, createdAt: datetime()}]->
          (email:EmailAddress:Property {
            active: true,
            value: $email,
            createdAt: datetime()
          }),
          (user)-[:token {active: true, createdAt: datetime()}]->(token),
          (user)-[:password {active: true, createdAt: datetime()}]->
          (password:Property {
            active: true,
            value: $pash
          }),
          (user)-[:realFirstName {active: true, createdAt: datetime()}]->
          (realFirstName:Property {
            active: true,
            value: $realFirstName
          }),
          (user)-[:realLastName {active: true, createdAt: datetime()}]->
          (realLastName:Property {
            active: true,
            value: $realLastName
          }),
          (user)-[:displayFirstName {active: true, createdAt: datetime()}]->
          (displayFirstName:Property {
            active: true,
            value: $displayFirstName
          }),
          (user)-[:displayLastName {active: true, createdAt: datetime()}]->
          (displayLastName:Property {
            active: true,
            value: $displayLastName
          }),
          (user)-[:phone {active: true, createdAt: datetime()}]->
          (phone:Property {
            active: true,
            value: $phone
          }),
          (user)-[:timezone {active: true, createdAt: datetime()}]->
          (timezone:Property {
            active: true,
            value: $timezone
          }),
          (user)-[:bio {active: true, createdAt: datetime()}]->
          (bio:Property {
            active: true,
            value: $bio
          }),
          (user)<-[:member]-
          (acl:ACL {
            canReadRealFirstName: true,
            canEditRealFirstName: true,
            canReadRealLastName: true,
            canEditRealLastName: true,
            canReadDisplayFirstName: true,
            canEditDisplayFirstName: true,
            canReadDisplayLastName: true,
            canEditDisplayLastName: true,
            canReadPassword: true,
            canEditPassword: true,
            canReadEmail: true,
            canEditEmail: true,
            canReadEducation: true,
            canEditEducation: true,
            canReadPhone: true,
            canEditPhone: true,
            canReadTimezone: true,
            canEditTimezone: true,
            canReadBio: true,
            canEditBio: true
          })
          -[:toNode]->(user)
        RETURN
          user.id as id,
          email.value as email,
          user.createdAt as createdAt,
          realFirstName.value as realFirstName,
          realLastName.value as realLastName,
          displayFirstName.value as displayFirstName,
          displayLastName.value as displayLastName,
          phone.value as phone,
          timezone.value as timezone,
          bio.value as bio,
          acl.canReadRealFirstName as canReadRealFirstName,
          acl.canEditRealFirstName as canEditRealFirstName,
          acl.canReadRealLastName as canReadRealLastName,
          acl.canEditRealLastName as canEditRealLastName,
          acl.canReadDisplayFirstName as canReadDisplayFirstName,
          acl.canEditDisplayFirstName as canEditDisplayFirstName,
          acl.canReadDisplayLastName as canReadDisplayLastName,
          acl.canEditDisplayLastName as canEditDisplayLastName,
          acl.canReadPassword as canReadPassword,
          acl.canEditPassword as canEditPassword,
          acl.canReadEmail as canReadEmail,
          acl.canEditEmail as canEditEmail,
          acl.canReadPhone as canReadPhone,
          acl.canEditPhone as canEditPhone,
          acl.canReadTimezone as canReadTimezone,
          acl.canEditTimezone as canEditTimezone,
          acl.canReadBio as canReadBio,
          acl.canEditBio as canEditBio
        `,
        {
          id: generate(),
          token: session.token,
          email: input.email,
          realFirstName: input.realFirstName,
          realLastName: input.realLastName,
          displayFirstName: input.displayFirstName,
          displayLastName: input.displayLastName,
          phone: input.phone,
          timezone: input.timezone,
          bio: input.bio,
          pash,
        },
      )
      .first();
    if (!result) {
      throw new Error('Could not create user');
    }

    return {
      id: result.id,
      createdAt: result.createdAt,
      email: {
        value: result.email,
        canRead: result.canReadEmail,
        canEdit: result.canEditEmail,
      },
      realFirstName: {
        value: result.realFirstName,
        canRead: result.canReadRealFirstName,
        canEdit: result.canEditRealFirstName,
      },
      realLastName: {
        value: result.realLastName,
        canRead: result.canReadRealLastName,
        canEdit: result.canEditRealLastName,
      },
      displayFirstName: {
        value: result.displayLastName,
        canRead: result.canReadDisplayFirstName,
        canEdit: result.canEditDisplayFirstName,
      },
      displayLastName: {
        value: result.displayLastName,
        canRead: result.canReadDisplayLastName,
        canEdit: result.canEditDisplayLastName,
      },
      phone: {
        value: result.phone,
        canRead: result.canReadPhone,
        canEdit: result.canEditPhone,
      },
      timezone: {
        value: result.timezone,
        canRead: result.canReadTimezone,
        canEdit: result.canEditTimezone,
      },
      bio: {
        value: result.bio,
        canRead: result.canReadBio,
        canEdit: result.canEditBio,
      },
    };
  }

  async readOne(id: string, session: ISession): Promise<User> {
    const result = await this.propertyUpdater.readProperties({
      id,
      session,
      props: [
        "email",
        "realFirstName",
        "realLastName",
        "displayFirstName",
        "displayLastName",
        "phone",
        "timezone",
        "bio",
        "createdAt",
        "id"
      ],
      nodevar: "user"
    });
    
    if (!result) {
      throw new NotFoundException('Could not find user');
    }

    return {
      ...result,
      id: result.id,
      createdAt: result.createdAt,
    } as User;
  }

  async update(input: UpdateUser, session: ISession): Promise<User> {
    const user = await this.readOne(input.id, session);

    return this.propertyUpdater.updateProperties({
      session,
      object: user,
      props: [
        'realFirstName',
        'realLastName',
        'displayFirstName',
        'displayLastName',
        'phone',
        'timezone',
        'bio'
      ],
      changes: input,
      nodevar: 'user',
    });
  }

  async delete(id: string, session: ISession): Promise<void> {
    await this.db
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
        (requestingUser)
        <-[:member]-(acl:ACL {
          canDeleteOwnUser: true
        })
        -[:toNode]->
        (user:User {
          active: true,
          id: $userToDeleteId
        })
        <-[oldTokenRels:token]-
        ()
        SET
          user.active = false
        DELETE oldTokenRels
        RETURN
          user.id as id
        `,
        {
          requestingUserId: session.userId,
          token: session.token,
          userToDeleteId: id,
        },
      )
      .run();
  }
}
