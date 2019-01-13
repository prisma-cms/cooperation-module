
import fs from "fs";

import chalk from "chalk";

import PrismaModule from "@prisma-cms/prisma-module";

import UserModule from "@prisma-cms/user-module";
import LogModule from "@prisma-cms/log-module";
import RouterModule from "@prisma-cms/router-module";
import MailModule from "@prisma-cms/mail-module";
import UploadModule from "@prisma-cms/upload-module";

import ProjectModule from "./project";
import ProjectMemberModule from "./projectMember";
import TaskModule from "./task";
import TimerModule from "./timer";
import TeamModule from "./team";
import TeamMemberModule from "./teamMember";
import ServiceModule from "./service";
import PositionModule from "./position";

import MergeSchema from 'merge-graphql-schemas';

import path from 'path';

const moduleURL = new URL(import.meta.url);

const __dirname = path.dirname(moduleURL.pathname);

const { createWriteStream, unlinkSync } = fs;

const { fileLoader, mergeTypes } = MergeSchema



class Module extends PrismaModule {


  constructor(props = {}) {

    super(props);

    this.mergeModules([
      UserModule,
      LogModule,
      RouterModule,
      MailModule,
      UploadModule,

      ProjectModule,
      ProjectMemberModule,
      TaskModule,
      TimerModule,
      TeamModule,
      TeamMemberModule,
      ServiceModule,
      PositionModule,
    ]);

    this.Subscription = {
    }
  }


  getSchema(types = []) {


    let schema = fileLoader(__dirname + '/schema/database/', {
      recursive: true,
    });


    if (schema) {
      types = types.concat(schema);
    }


    let typesArray = super.getSchema(types);

    return typesArray;

  }


  getApiSchema(types = []) {


    let baseSchema = [];

    let schemaFile = __dirname + "/../schema/generated/prisma.graphql";

    if (fs.existsSync(schemaFile)) {
      baseSchema = fs.readFileSync(schemaFile, "utf-8");
    }

    let apiSchema = super.getApiSchema(types.concat(baseSchema), [
      "ProjectCreateInput",
      "ProjectUpdateInput",
      "TaskCreateInput",
      "TaskUpdateInput",
      "TimerCreateInput",
      "TimerUpdateInput",

      "ProjectMemberCreateInput",
      "ProjectMemberUpdateInput",
      "ProjectCreateOneWithoutMembersInput",
      "UserCreateOneWithoutProjectsInput",
      "ServiceCreateManyWithoutProjectsInput",
      "ServiceUpdateManyWithoutProjectsInput",

      "TeamCreateInput",
      "TeamUpdateInput",
      "TeamCreateOneWithoutChildsInput",
      "TeamCreateManyWithoutParentInput",
      "TeamMemberCreateManyWithoutTeamInput",
      "ProjectCreateManyWithoutTeamInput",
      "TeamUpdateOneWithoutChildsInput",
      "TeamUpdateManyWithoutParentInput",
      "TeamMemberUpdateManyWithoutTeamInput",
      "ProjectUpdateManyWithoutTeamInput",

      "TeamMemberCreateInput",
      "TeamMemberUpdateInput",
      "TeamCreateOneWithoutMembersInput",
      "UserCreateOneWithoutTeamsInput",

      "PositionCreateInput",
      "PositionUpdateInput",
      "UserCreateManyWithoutPositionsInput",
      "UserUpdateManyWithoutPositionsInput",
    ]);

    let schema = fileLoader(__dirname + '/schema/api/', {
      recursive: true,
    });

    apiSchema = mergeTypes([apiSchema.concat(schema)], { all: true });


    return apiSchema;

  }


  getResolvers() {

    const resolvers = super.getResolvers();


    Object.assign(resolvers.Query, this.Query);

    Object.assign(resolvers.Mutation, this.Mutation);

    Object.assign(resolvers.Subscription, this.Subscription);


    Object.assign(resolvers, {
    });

    return resolvers;
  }


}


export default Module;