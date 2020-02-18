import { BudgetDetails, BudgetStatus } from '../budget';
import { Field, InputType, ObjectType } from 'type-graphql';

import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

// READ

@InputType()
export class ReadBudgetInput {
  @Field(type => String)
  id: string;
}

@InputType()
export class ReadBudgetInputDto {
  @Field()
  budget: ReadBudgetInput;
}
@ObjectType()
export class ReadBudgetOutput {
  @Field(type => String)
  id: string;

  @Field(type => BudgetStatus)
  status: BudgetStatus;

  @Field(type => [BudgetDetails], { nullable: true })
  budgetDetails: BudgetDetails[];
}
@ObjectType()
export class ReadBudgetOutputDto {
  @Field({ nullable: true }) // nullable in case of error
  budget: ReadBudgetOutput;

  constructor() {
    this.budget = new ReadBudgetOutput();
  }
}

// DELETE

@InputType()
export class DeleteBudgetInput {
  @Field(type => String)
  id: string;
}

@InputType()
export class DeleteBudgetInputDto {
  @Field()
  budget: DeleteBudgetInput;
}

@ObjectType()
export class DeleteBudgetOutput {
  @Field(type => String)
  id: string;
}

@ObjectType()
export class DeleteBudgetOutputDto {
  @Field({ nullable: true }) // nullable in case of error
  budget: DeleteBudgetOutput;

  constructor() {
    this.budget = new DeleteBudgetOutput();
  }
}
