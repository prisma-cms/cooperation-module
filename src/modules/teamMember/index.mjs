

import chalk from "chalk";

import PrismaModule from "@prisma-cms/prisma-module";
import PrismaProcessor from "@prisma-cms/prisma-processor";


export class TeamMemberProcessor extends PrismaProcessor {

  constructor(props) {

    super(props);

    this.objectType = "TeamMember";

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

    const exists = await db.exists.TeamMember({
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



class TeamMemberModule extends PrismaModule {


  getResolvers() {

    const resolvers = super.getResolvers();


    Object.assign(resolvers.Query, {
      teamMember: this.teamMember,
      teamMembers: this.teamMembers,
      teamMembersConnection: this.teamMembersConnection,
    });


    Object.assign(resolvers.Mutation, {
      createTeamMemberProcessor: this.createTeamMemberProcessor.bind(this),
      updateTeamMemberProcessor: this.updateTeamMemberProcessor.bind(this),
    });

    // Object.assign(resolvers.Subscription, this.Subscription);


    Object.assign(resolvers, {
      TeamMemberResponse: this.TeamMemberResponse(),
    });

    return resolvers;
  }


  teamMembers(source, args, ctx, info) {
    return ctx.db.query.teamMembers({}, info);
  }

  teamMember(source, args, ctx, info) {
    return ctx.db.query.teamMember({}, info);
  }

  teamMembersConnection(source, args, ctx, info) {
    return ctx.db.query.teamMembersConnection({}, info);
  }


  getProcessor(ctx) {
    return new (this.getProcessorClass())(ctx);
  }

  getProcessorClass() {
    return TeamMemberProcessor;
  }

  createTeamMemberProcessor(source, args, ctx, info) {

    return this.getProcessor(ctx).createWithResponse("TeamMember", args, info);
  }

  updateTeamMemberProcessor(source, args, ctx, info) {

    return this.getProcessor(ctx).updateWithResponse("TeamMember", args, info);
  }

  TeamMemberResponse() {

    return {
      data: (source, args, ctx, info) => {

        const {
          id,
        } = source.data || {};

        return id ? ctx.db.query.teamMember({
          where: {
            id,
          },
        }, info) : null;
      }
    }
  }

}


export default TeamMemberModule;