import { Resolver, Args, Query, Mutation } from '@nestjs/graphql';
import { IdArg } from '../../common';
import { ISession, Session } from '../auth';
import {
  CreateCountryInput,
  CreateCountryOutput,
  CreateRegionInput,
  CreateRegionOutput,
  CreateZoneInput,
  CreateZoneOutput,
  Location,
  LocationListInput,
  LocationListOutput,
  UpdateCountryInput,
  UpdateCountryOutput,
  UpdateRegionOutput,
  UpdateRegionInput,
  UpdateZoneOutput,
  UpdateZoneInput,
} from './dto';
import { LocationService } from './location.service';

@Resolver()
export class LocationResolver {
  constructor(private readonly locationService: LocationService) {}

  @Query(() => Location, {
    description: 'Read one Location by id',
  })
  async location(
    @Session() session: ISession,
    @IdArg() id: string,
  ): Promise<Location> {
    return this.locationService.readOne(id, session.token);
  }

  @Query(() => LocationListOutput, {
    description: 'Look up locations',
  })
  async locations(
    @Session() session: ISession,
    @Args({
      name: 'input',
      type: () => LocationListInput,
      defaultValue: LocationListInput.defaultVal,
    })
    input: LocationListInput,
  ): Promise<LocationListOutput> {
    return this.locationService.list(input, session.token);
  }

  @Mutation(() => CreateZoneOutput, {
    description: 'Create a zone',
  })
  async createZone(
    @Session() session: ISession,
    @Args('input') { zone: input }: CreateZoneInput,
  ): Promise<CreateZoneOutput> {
    const zone = await this.locationService.createZone(input, session.token);
    return { zone };
  }

  @Mutation(() => CreateRegionOutput, {
    description: 'Create a region',
  })
  async createRegion(
    @Session() session: ISession,
    @Args('input') { region: input }: CreateRegionInput,
  ): Promise<CreateRegionOutput> {
    const region = await this.locationService.createRegion(input, session.token);
    return { region };
  }

  @Mutation(() => CreateCountryOutput, {
    description: 'Create a country',
  })
  async createCountry(
    @Session() session: ISession,
    @Args('input') { country: input }: CreateCountryInput,
  ): Promise<CreateCountryOutput> {
    const country = await this.locationService.createCountry(input, session.token);
    return { country };
  }

  @Mutation(() => UpdateZoneOutput, {
    description: 'Update a zone',
  })
  async updateZone(
    @Session() session: ISession,
    @Args('input') { zone: input }: UpdateZoneInput,
  ): Promise<UpdateZoneOutput> {
    const zone = await this.locationService.updateZone(input, session.token);
    return { zone };
  }

  @Mutation(() => UpdateRegionOutput, {
    description: 'Update a region',
  })
  async updateRegion(
    @Session() session: ISession,
    @Args('input') { region: input }: UpdateRegionInput,
  ): Promise<UpdateRegionOutput> {
    const region = await this.locationService.updateRegion(input, session.token);
    return { region };
  }

  @Mutation(() => UpdateCountryOutput, {
    description: 'Update a country',
  })
  async updateCountry(
    @Session() session: ISession,
    @Args('input') { country: input }: UpdateCountryInput,
  ): Promise<UpdateCountryOutput> {
    const country = await this.locationService.updateCountry(input, session.token);
    return { country };
  }

  @Mutation(() => Boolean, {
    description: 'Delete a location',
  })
  async deleteLocation(
    @Session() session: ISession,
    @IdArg() id: string,
  ): Promise<boolean> {
    await this.locationService.delete(id, session.token);
    return true;
  }
}
