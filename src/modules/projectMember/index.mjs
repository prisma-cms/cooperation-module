

import chalk from "chalk";

import PrismaModule from "@prisma-cms/prisma-module";
import PrismaProcessor from "@prisma-cms/prisma-processor";


export class ProjectMemberProcessor extends PrismaProcessor {

  constructor(props) {

    super(props);

    this.objectType = "ProjectMember";

    this.private = true;

  }


  async create(method, args, info) {

    let {
      data: {
        ...data
      },
    } = args;


    const CreatedBy = this.getCreatedBy();


    if (!CreatedBy) {
      return;
    }

    const {
      db,
      currentUser,
    } = this.ctx;

    const {
      id: currentUserId,
    } = currentUser;


    /**
     * Проверяем уникальность
     */
    await this.checkUniqueOnCreate(args);


    Object.assign(data, {
      ...CreatedBy,
    });


    Object.assign(args, {
      data,
    });


    return super.create(method, args, info);
  }


  async mutate(method, args, info) {

    // let {
    //   data: { 
    //     ...data
    //   },
    // } = args;


    // Object.assign(data, { 
    // });


    // Object.assign(args, {
    //   data,
    // });

    return super.mutate(method, args);
  }



  getCreatedBy() {

    const {
      currentUser,
    } = this.ctx;

    if (!currentUser) {
      this.addError("Необходимо авторизоваться");
      return;
    }

    const {
      id,
    } = currentUser;

    return {
      CreatedBy: {
        connect: {
          id,
        },
      },
    }
  }


  /**
   * Проверяем уникальность
   */
  async checkUniqueOnCreate(args) {

    const {
      data: {
        Team,
        User,
      },
    } = args;

    const {
      db,
    } = this.ctx;

    const {
      connect: teamWhere,
    } = Team || {};

    const {
      connect: userWhere,
    } = User || {};

    if (!teamWhere) {
      return this.addError("Не было получено условие проверки компании");
    }

    if (!userWhere) {
      return this.addError("Не было получено условие проверки пользователя");
    }

    const exists = await db.exists.ProjectMember({
      Team: {
        ...teamWhere,
      },
      User: {
        ...userWhere,
      },
    });

    // console.log("exists", exists);

    if (exists) {
      this.addError("Пользователь уже есть в этой компании");
    }

  }

}



class ProjectMemberModule extends PrismaModule {


  getResolvers() {

    const resolvers = super.getResolvers();


    Object.assign(resolvers.Query, {
      projectMember: this.projectMember,
      projectMembers: this.projectMembers,
      projectMembersConnection: this.projectMembersConnection,
    });


    Object.assign(resolvers.Mutation, {
      createProjectMemberProcessor: this.createProjectMemberProcessor.bind(this),
      updateProjectMemberProcessor: this.updateProjectMemberProcessor.bind(this),
      deleteProjectMember: this.deleteProjectMember.bind(this),
    });

    // Object.assign(resolvers.Subscription, this.Subscription);


    Object.assign(resolvers, {
      ProjectMemberResponse: this.ProjectMemberResponse(),


      Subscription: {
        projectMember: {
          subscribe: async (parent, args, ctx, info) => {
  
            return ctx.db.subscription.projectMember({}, info);
          },
        },
      },
    });

    return resolvers;
  }


  projectMembers(source, args, ctx, info) {
    return ctx.db.query.projectMembers(args, info);
  }

  projectMember(source, args, ctx, info) {
    return ctx.db.query.projectMember(args, info);
  }

  projectMembersConnection(source, args, ctx, info) {
    return ctx.db.query.projectMembersConnection(args, info);
  }


  getProcessor(ctx) {
    return new (this.getProcessorClass())(ctx);
  }

  getProcessorClass() {
    return ProjectMemberProcessor;
  }

  createProjectMemberProcessor(source, args, ctx, info) {

    return this.getProcessor(ctx).createWithResponse("ProjectMember", args, info);
  }

  updateProjectMemberProcessor(source, args, ctx, info) {

    return this.getProcessor(ctx).updateWithResponse("ProjectMember", args, info);
  }

  deleteProjectMember(source, args, ctx, info) {

    return this.getProcessor(ctx).delete("ProjectMember", args, info);
  }

  ProjectMemberResponse() {

    return {
      data: (source, args, ctx, info) => {

        const {
          id,
        } = source.data || {};

        return id ? ctx.db.query.projectMember({
          where: {
            id,
          },
        }, info) : null;
      }
    }
  }

}


export default ProjectMemberModule;