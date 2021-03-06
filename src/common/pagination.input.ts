import { Max, Min } from 'class-validator';
import { stripIndent } from 'common-tags';
import { Field, InputType, Int } from 'type-graphql';
import { Order } from './order.enum';

@InputType({
  isAbstract: true,
})
export abstract class PaginationInput {
  @Field(() => Int, {
    description: 'The number of items to return in a single page',
  })
  @Min(1)
  @Max(100)
  readonly count = 25;

  @Field(() => Int, {
    description: stripIndent`
      1-indexed page number for offset pagination.
    `,
    nullable: true,
  })
  @Min(1)
  readonly page = 1;

  protected constructor() {
    // no instantiation, shape only
  }
}

@InputType({
  isAbstract: true,
})
export abstract class CursorPaginationInput {
  @Field(() => Int, {
    description: 'The number of items to return in a single page',
  })
  readonly count = 25;

  @Field({
    description: stripIndent`
      Return items starting after this cursor.
      This usually is the endCursor from the previous page/call to fetch the next page.
    `,
    nullable: true,
  })
  readonly after?: string;

  @Field({
    description: stripIndent`
      Return items starting before this cursor.
      This usually is the startCursor from the previous page/call to fetch the previous page.
    `,
    nullable: true,
  })
  readonly before?: string;

  protected constructor() {
    // no instantiation, shape only
  }
}

export const SortablePaginationInput = <SortKey extends string = string>({
  defaultSort,
  defaultOrder,
}: {
  defaultSort: SortKey;
  defaultOrder?: Order;
}) => {
  @InputType({
    isAbstract: true,
  })
  abstract class SortablePaginationInputClass extends PaginationInput {
    @Field(() => String, {
      nullable: true,
      description: 'The field in which to sort on',
      defaultValue: defaultSort,
    })
    readonly sort: SortKey = defaultSort;

    @Field(() => Order, {
      description: 'The order in which to sort the list',
      defaultValue: defaultOrder ?? Order.ASC,
    })
    readonly order: Order = defaultOrder ?? Order.ASC;
  }

  return SortablePaginationInputClass;
};
