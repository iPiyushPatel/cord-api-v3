import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { IdArg } from '../../../common';
import { ISession, Session } from '../../auth';
import {
  CreateUnavailabilityInput,
  CreateUnavailabilityOutput,
  UpdateUnavailabilityInput,
  UpdateUnavailabilityOutput,
  UnavailabilityListInput,
  SecuredUnavailabilityList,
  Unavailability,
} from './dto';
import { UnavailabilityService } from './unavailability.service';

@Resolver()
export class UnavailabilityResolver {
  constructor(private readonly service: UnavailabilityService) {}

  @Query(() => Unavailability, {
    description: 'Look up a unavailability by its ID',
  })
  async unavailability(
    @Session() session: ISession,
    @IdArg() id: string,
  ): Promise<Unavailability> {
    return await this.service.readOne(id, session);
  }

  // @Query(() => SecuredUnavailabilityList, {
  //   description: 'Look up unavailabilities for a user',
  // })
  // async unavailabilities(
  //   @RequestUser() token: IRequestUser,
  //   @Args({
  //     userId: 'id',
  //     type: () => UnavailabilityListInput,
  //     defaultValue: UnavailabilityListInput.defaultVal,
  //   })
  //   input: UnavailabilityListInput,
  // ): Promise<SecuredUnavailabilityList> {
  //   return this.service.list(userId, input, token);
  // }

  @Mutation(() => CreateUnavailabilityOutput, {
    description: 'Create an unavailability',
  })
  async createUnavailability(
    @Session() session: ISession,
    @Args('input') { unavailability: input }: CreateUnavailabilityInput,
  ): Promise<CreateUnavailabilityOutput> {
    const unavailability = await this.service.create(input, session);
    return { unavailability };
  }

  @Mutation(() => UpdateUnavailabilityOutput, {
    description: 'Update an unavailability',
  })
  async updateUnavailability(
    @Session() session: ISession,
    @Args('input') { unavailability: input }: UpdateUnavailabilityInput,
  ): Promise<UpdateUnavailabilityOutput> {
    const unavailability = await this.service.update(input, session);
    return { unavailability };
  }

  @Mutation(() => Boolean, {
    description: 'Delete an unavailability',
  })
  async deleteUnavailability(
    @Session() session: ISession,
    @IdArg() id: string,
  ): Promise<boolean> {
    await this.service.delete(id, session);
    return true;
  }
}
