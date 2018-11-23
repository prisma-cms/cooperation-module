
import fs from "fs";

import chalk from "chalk";

import PrismaModule from "@prisma-cms/prisma-module";
import UserModule from "@prisma-cms/user-module";
import LogModule from "@prisma-cms/log-module";
import RouterModule from "@prisma-cms/router-module";
import MailModule from "@prisma-cms/mail-module";
import UploadModule from "@prisma-cms/upload-module";

import ProjectModule from "./project";
import TaskModule from "./task";
import TimerModule from "./timer";

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
      TaskModule,
      TimerModule,
    ]);

    this.Subscription = {
      project: {
        subscribe: async (parent, args, ctx, info) => {

          return ctx.db.subscription.project({}, info);
        },
      },
      task: {
        subscribe: async (parent, args, ctx, info) => {

          return ctx.db.subscription.task({}, info);
        },
      },
      timer: {
        subscribe: async (parent, args, ctx, info) => {

          return ctx.db.subscription.timer({}, info);
        },
      },
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

    let schemaFile = "src/schema/generated/prisma.graphql";

    if (fs.existsSync(schemaFile)) {
      baseSchema = fs.readFileSync(schemaFile, "utf-8");
    }

    let apiSchema = super.getApiSchema(types.concat(baseSchema), [
      "ProjectMemberCreateManyInput",
      "ProjectCreateInput",
      "TaskCreateManyWithoutProjectInput",
      "TaskCreateInput",
      "ProjectCreateOneWithoutTasksInput",
      "TaskCreateOneWithoutChildsInput",
      "TaskCreateManyWithoutParentInput",
      "TimerCreateInput",
      "TaskCreateOneWithoutTimersInput",
      "TaskCreateManyWithoutRelatedFromInput",
      "TaskCreateManyWithoutRelatedToInput",
      "TaskCreateOneWithoutMembersInput",
      "UserCreateOneInput",
      "UserCreateOneWithoutTasksInput",
      "TeamCreateOneWithoutChildsInput",
      "TeamCreateManyWithoutParentInput",
      "UserCreateOneWithoutTeamsCreatedInput",
      "TeamMemberCreateManyWithoutTeamInput",
      "ProjectCreateOneInput",
      "UserCreateOneWithoutProjectsInput",
      "ServiceCreateOneInput",
      "TeamCreateOneWithoutMembersInput",
      "UserCreateOneWithoutTeamsInput",
      "ServiceUpdateOneInput",
      "UserUpdateOneInput",
      "ProjectUpdateOneInput",
      "UserUpdateOneWithoutProjectsInput",
      "TaskUpdateManyWithoutProjectInput",
      "UserUpdateOneWithoutProjectsCreatedInput",
      "ProjectMemberUpdateManyInput",
      "TaskUpdateOneWithoutTimersInput",
      "UserUpdateOneWithoutTimersInput",
      "UserUpdateOneWithoutTeamsInput",
      "TeamUpdateOneWithoutMembersInput",
      "TeamMemberUpdateManyWithoutTeamInput",
      "UserUpdateOneWithoutTeamsCreatedInput",
      "TeamUpdateManyWithoutParentInput",
      "TeamUpdateOneWithoutChildsInput",
      "UserUpdateOneWithoutTasksInput",
      "TaskUpdateOneWithoutMembersInput",
      "TaskMemberUpdateManyWithoutTaskInput",
      "ProjectUpdateOneWithoutTasksInput",
      "TaskMemberUpdateManyWithoutTaskInput",
      "TaskUpdateOneWithoutChildsInput",
      "TaskUpdateManyWithoutParentInput",
      "TaskUpdateManyWithoutRelatedToInput",
      "TaskUpdateManyWithoutRelatedFromInput",
      "TimerUpdateManyWithoutTaskInput",
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