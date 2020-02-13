import { Type } from 'class-transformer';
import { Field, InputType, ObjectType } from 'type-graphql';
import { FileNodeType } from './type';

@InputType()
export abstract class CreateNode {
  @Field(type => String)
  name: string;

  @Field(type => String)
  type: string;
}

@InputType()
export abstract class CreateNodeInput {
  @Field()
  @Type(() => CreateNode)
  readonly node: CreateNode;
}

@ObjectType()
export abstract class CreateNodeOutput {
  @Field(type => String, { nullable: true })
  id: string;
  @Field(type => String, { nullable: true })
  url: string;
}

@ObjectType()
export abstract class CreateNodeOutputDto {
  @Field()
  @Type(() => CreateNodeOutput)
  readonly node: CreateNodeOutput;
}

@InputType()
export abstract class CreateTempNode {
  @Field(type => String)
  name: string;
}

@InputType()
export abstract class CreateTempNodeInput {
  @Field()
  @Type(() => CreateTempNode)
  readonly createTempNode: CreateTempNode;
}

@ObjectType()
export class CreateTempNodeOutput {
  @Field(type => String, { nullable: true })
  id: string;
  @Field(type => String, { nullable: true })
  url: string;
}

@ObjectType()
export class CreatTempNodeOutputDto {
  @Field({ nullable: true }) // nullable in case of error
  node: CreateTempNodeOutput;

  constructor() {
    this.node = new CreateTempNodeOutput();
  }
}
