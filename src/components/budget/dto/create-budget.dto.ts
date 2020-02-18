import { BudgetDetails, BudgetStatus } from '../budget';
import { Field, InputType, ObjectType } from 'type-graphql';

import { Budget } from '..';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

// CREATE
@InputType()
export class CreateBudget {
  @Field(type => BudgetStatus)
  status: BudgetStatus;

  @Field(type => [BudgetDetails], { nullable: true })
  budgetDetails: BudgetDetails[];
}

@InputType()
export class CreateBudgetInput {
  @Field()
  @Type(() => CreateBudget)
  readonly budget: CreateBudget;
}

@InputType()
export class CreateBudgetInputDto {
  @Field()
  budget: CreateBudgetInput;
}

@ObjectType()
export class CreateBudgetOutput {
  @Field()
  readonly budget: Budget;
}

@ObjectType()
export class CreateBudgetOutputDto {
  @Field({ nullable: true }) // nullable in case of error
  budget: CreateBudgetOutput;

  constructor() {
    this.budget = new CreateBudgetOutput();
  }
}
