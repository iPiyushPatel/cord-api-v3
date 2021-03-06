import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { Field, InputType, ObjectType } from 'type-graphql';
import { PaginatedList, SortablePaginationInput } from '../../../common';
import { User } from './user.dto';

@InputType()
export abstract class UserFilters {
  @Field({
    description: 'Only users matching this name',
    nullable: true,
  })
  readonly name?: string;
}

const defaultFilters = {};

@InputType()
export class UserListInput extends SortablePaginationInput<keyof User>({
  defaultSort: 'id', // TODO How to sort on name?
}) {
  static defaultVal = new UserListInput();

  @Field({ nullable: true })
  @Type(() => UserFilters)
  @ValidateNested()
  readonly filter: UserFilters = defaultFilters;
}

@ObjectType()
export class UserListOutput extends PaginatedList(User) {}
