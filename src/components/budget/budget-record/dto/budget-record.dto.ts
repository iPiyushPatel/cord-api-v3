import { Field, ID, InputType, ObjectType } from 'type-graphql';

import { Organization } from '../../../organization';

@ObjectType()
@InputType('BudgetRecordInput')
export class BudgetRecord {
  @Field()
  organization: Organization;

  @Field({ nullable: true })
  fiscalYear: number;

  @Field({ nullable: true })
  amount: number;
}

// READ

@InputType()
export class ReadBudgetRecordInput {
  @Field(type => String)
  id: string;
}

@InputType()
export class ReadBudgetRecordInputDto {
  @Field()
  budgetRecord: ReadBudgetRecordInput;
}

@ObjectType()
export class ReadBudgetRecordOutput {
  @Field()
  organization: Organization;

  @Field({ nullable: true })
  fiscalYear: number;

  @Field({ nullable: true })
  amount: number;
}

@ObjectType()
export class ReadBudgetRecordOutputDto {
  @Field({ nullable: true }) // nullable in case of error
  budgetRecord: ReadBudgetRecordOutput;

  constructor() {
    this.budgetRecord = new ReadBudgetRecordOutput();
  }
}

// DELETE

@InputType()
export class DeleteBudgetRecordInput {
  @Field(type => String)
  id: string;
}

@InputType()
export class DeleteBudgetRecordInputDto {
  @Field()
  budgetRecord: DeleteBudgetRecordInput;
}

@ObjectType()
export class DeleteBudgetRecordOutput {
  @Field(type => String)
  id: string;
}

@ObjectType()
export class DeleteBudgetRecordOutputDto {
  @Field({ nullable: true }) // nullable in case of error
  budgetRecord: DeleteBudgetRecordOutput;

  constructor() {
    this.budgetRecord = new DeleteBudgetRecordOutput();
  }
}
