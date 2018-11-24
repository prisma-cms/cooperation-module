

import chalk from "chalk";

import PrismaModule from "@prisma-cms/prisma-module";
import PrismaProcessor from "@prisma-cms/prisma-processor";


export class TeamProcessor extends PrismaProcessor {

  constructor(props) {

    super(props);

    this.objectType = "Team";

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


    Object.assign(data, {
      ...CreatedBy,
    });


    /**
     * Получаем и завершаем запущенные таски, если имеются
     */
    const activeTeams = await db.query.teams({
      where: {
        CreatedBy: {
          id: currentUserId,
        },
        stopedAt: null,
      },
    });


    if (activeTeams && activeTeams.length) {

      activeTeams.map(async ({ id }) => {

        const args = {
          where: {
            id,
          },
          data: {
            stopedAt: new Date(),
          }
        };

        // await this.mutate("updateTeam", args);
        await db.mutation.updateTeam(args);

      });

    }



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

}



class TeamModule extends PrismaModule {


  getResolvers() {

    const resolvers = super.getResolvers();


    Object.assign(resolvers.Query, {
      team: this.team,
      teams: this.teams,
      teamsConnection: this.teamsConnection,
    });


    Object.assign(resolvers.Mutation, {
      createTeamProcessor: this.createTeamProcessor.bind(this),
      updateTeamProcessor: this.updateTeamProcessor.bind(this),
    });

    // Object.assign(resolvers.Subscription, this.Subscription);


    Object.assign(resolvers, {
      TeamResponse: this.TeamResponse(),
    });

    return resolvers;
  }


  teams(source, args, ctx, info) {
    return ctx.db.query.teams({}, info);
  }

  team(source, args, ctx, info) {
    return ctx.db.query.team({}, info);
  }

  teamsConnection(source, args, ctx, info) {
    return ctx.db.query.teamsConnection({}, info);
  }


  getProcessor(ctx) {
    return new (this.getProcessorClass())(ctx);
  }

  getProcessorClass() {
    return TeamProcessor;
  }

  createTeamProcessor(source, args, ctx, info) {

    return this.getProcessor(ctx).createWithResponse("Team", args, info);
  }

  updateTeamProcessor(source, args, ctx, info) {

    return this.getProcessor(ctx).updateWithResponse("Team", args, info);
  }

  TeamResponse() {

    return {
      data: (source, args, ctx, info) => {

        const {
          id,
        } = source.data || {};

        return id ? ctx.db.query.team({
          where: {
            id,
          },
        }, info) : null;
      }
    }
  }

}


export default TeamModule;