import { BudgetDetails, BudgetStatus } from '../budget';
import { Field, InputType, ObjectType } from 'type-graphql';

// UPDATE

@InputType()
export class UpdateBudgetInput {
  @Field(type => String)
  id: string;

  @Field(type => BudgetStatus)
  status: BudgetStatus;
  @Field(type => [BudgetDetails], { nullable: true })
  budgetDetails: BudgetDetails[];
}

@InputType()
export class UpdateBudgetInputDto {
  @Field()
  budget: UpdateBudgetInput;
}

@ObjectType()
export class UpdateBudgetOutput {
  @Field(type => String)
  id: string;
  @Field(type => BudgetStatus)
  status: BudgetStatus;
  @Field(type => [BudgetDetails], { nullable: true })
  budgetDetails: BudgetDetails[];
}

@ObjectType()
export class UpdateBudgetOutputDto {
  @Field({ nullable: true }) // nullable in case of error
  budget: UpdateBudgetOutput;

  constructor() {
    this.budget = new UpdateBudgetOutput();
  }
}
