
import fs from "fs";

// import chalk from "chalk";

import PrismaModule from "@prisma-cms/prisma-module";

import UserModule from "@prisma-cms/user-module";
import LogModule from "@prisma-cms/log-module";
// import RouterModule from "@prisma-cms/router-module";
import MailModule from "@prisma-cms/mail-module";
import UploadModule from "@prisma-cms/upload-module";
import SocietyModule from "@prisma-cms/society-module";

import ProjectModule from "./project";
import ProjectMemberModule from "./projectMember";
import TaskModule from "./task";
import TaskReactionModule from "./taskReaction";
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
      // RouterModule,
      MailModule,
      UploadModule,
      SocietyModule,

      ProjectModule,
      ProjectMemberModule,
      TaskModule,
      TaskReactionModule,
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


      baseSchema = this.cleanupApiSchema(baseSchema, [
        "ChatRoomCreateInput",
        "ChatRoomUpdateInput",
        "UserCreateManyWithoutRoomsInput",
        "UserUpdateManyWithoutRoomsInput",
        // "ChatRoomInvitationUpdateManyWithoutRoomInput",

        "ChatMessageCreateInput",
        "ChatMessageUpdateInput",
        "ChatRoomCreateOneWithoutMessagesInput",

        "ChatMessageReadedCreateInput",
        "ChatMessageCreateOneWithoutReadedByInput",
      ]);

    }

    let apiSchema = super.getApiSchema(types.concat(baseSchema), [
      // "ProjectCreateInput",
      // "ProjectUpdateInput",
      "TaskCreateInput",
      // "TaskUpdateInput",
      // "TimerCreateInput",
      // "TimerUpdateInput",

      // "TaskReactionCreateInput",
      // "TaskReactionUpdateInput",
      // "TaskCreateOneInput",
      // "TaskUpdateOneInput",

      // "ProjectMemberCreateInput",
      // "ProjectMemberUpdateInput",
      // "ProjectCreateOneWithoutMembersInput",
      // "UserCreateOneWithoutProjectsInput",
      // "ServiceCreateManyWithoutProjectsInput",
      // "ServiceUpdateManyWithoutProjectsInput",

      // "TeamCreateInput",
      // "TeamUpdateInput",
      // "TeamCreateOneWithoutChildsInput",
      // "TeamCreateManyWithoutParentInput",
      // "TeamMemberCreateManyWithoutTeamInput",
      // "ProjectCreateManyWithoutTeamInput",
      // "TeamUpdateOneWithoutChildsInput",
      // "TeamUpdateManyWithoutParentInput",
      // "TeamMemberUpdateManyWithoutTeamInput",
      // "ProjectUpdateManyWithoutTeamInput",

      // "TeamMemberCreateInput",
      // "TeamMemberUpdateInput",
      // "TeamCreateOneWithoutMembersInput",
      // "UserCreateOneWithoutTeamsInput",

      // "PositionCreateInput",
      // "PositionUpdateInput",
      // "UserCreateManyWithoutPositionsInput",
      // "UserUpdateManyWithoutPositionsInput",

      // "TaskCreateOneWithoutChatRoomInput",

      // "ServiceCreateInput",
    ]);

    let schema = fileLoader(__dirname + '/schema/api/', {
      recursive: true,
    });

    apiSchema = mergeTypes([apiSchema.concat(schema)], { all: true });


    return apiSchema;

  }


  getResolvers() {

    const {
      // Query,
      // Mutation,
      // Subscription,
      ...other
    } = super.getResolvers();

    return {
      ...other,
      // Query: {
      //   ...Query,
      // },
      // Mutation: {
      //   ...Mutation,
      // },
      // Subscription: {
      //   ...Subscription,
      // },
    };
  }


}


export default Module;