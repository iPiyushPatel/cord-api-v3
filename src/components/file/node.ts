import { DateTime } from 'luxon';
import { FileNodeCategory } from './category';
import { FileNodeType } from './type';
import {
  ObjectType,
  InputType,
  Field,
  GraphQLISODateTime,
  Int,
} from 'type-graphql';

@ObjectType()
@InputType('FileNodeInput')
export class FileNode implements IBaseNode {
  @Field()
  id: string;

  @Field(type => String)
  fileNodeType: FileNodeType;

  @Field()
  name: string;

  @Field({ nullable: true })
  parents?: FileParentRef[];

  @Field(type => String, { nullable: true })
  category?: FileNodeCategory;
}

interface IBaseNode {
  id: string;
  fileNodeType: FileNodeType;
  name: string;
  parents?: FileParentRef[];
  category?: FileNodeCategory;
}

export interface IFile extends IBaseNode {
  size: number;
  versions: FileVersion[];
}

export interface IDirectory extends IBaseNode {
  childrenId: string[];
}

@ObjectType()
@InputType('FileParentInput')
export class FileParentRef {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  parentId: string | null;
}

@ObjectType()
@InputType('FileVersionInput')
export class FileVersion {
  @Field()
  id: string;

  @Field()
  eTag: string;

  @Field(type => GraphQLISODateTime)
  createdAt: DateTime;
}

@ObjectType()
@InputType('FileInput')
export class File extends FileNode implements IFile {
  @Field()
  id: string;

  @Field(type => String)
  name: string;

  @Field(type => String)
  category: FileNodeCategory;

  @Field(type => [FileVersion], { nullable: true })
  versions: FileVersion[];

  @Field(type => Int, { nullable: true })
  size: number;

  @Field(type => [FileParentRef])
  parents: FileParentRef[];
}

@ObjectType()
@InputType('DirectoryInput')
export class Directory extends FileNode implements IDirectory {
  @Field()
  id: string;

  @Field(type => String)
  name: string;

  @Field(type => String)
  category: FileNodeCategory;

  @Field(type => [FileVersion], { nullable: true })
  versions: FileVersion[];

  @Field(type => Int, { nullable: true })
  size: number;

  @Field(type => [String])
  childrenId: string[];

  @Field(type => [FileParentRef])
  parents: FileParentRef[];
}
