

import chalk from "chalk";

import PrismaModule from "@prisma-cms/prisma-module";
import PrismaProcessor from "@prisma-cms/prisma-processor";


export class TimerProcessor extends PrismaProcessor {

  constructor(props) {

    super(props);

    this.objectType = "Timer";

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
    const activeTimers = await db.query.timers({
      where: {
        CreatedBy: {
          id: currentUserId,
        },
        stopedAt: null,
      },
    });


    if (activeTimers && activeTimers.length) {

      activeTimers.map(async ({ id }) => {

        const args = {
          where: {
            id,
          },
          data: {
            stopedAt: new Date(),
          }
        };

        // await this.mutate("updateTimer", args);
        await db.mutation.updateTimer(args);

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



class TimerModule extends PrismaModule {


  getResolvers() {

    const resolvers = super.getResolvers();


    Object.assign(resolvers.Query, {
      timer: this.timer,
      timers: this.timers,
      timersConnection: this.timersConnection,
    });


    Object.assign(resolvers.Mutation, {
      createTimerProcessor: this.createTimerProcessor.bind(this),
    });

    // Object.assign(resolvers.Subscription, this.Subscription);


    Object.assign(resolvers, {
      TimerResponse: this.TimerResponse(),
    });

    return resolvers;
  }


  timers(source, args, ctx, info) {
    return ctx.db.query.timers({}, info);
  }

  timer(source, args, ctx, info) {
    return ctx.db.query.timer({}, info);
  }

  timersConnection(source, args, ctx, info) {
    return ctx.db.query.timersConnection({}, info);
  }


  getProcessor(ctx) {
    return new (this.getProcessorClass())(ctx);
  }

  getProcessorClass() {
    return TimerProcessor;
  }

  createTimerProcessor(source, args, ctx, info) {

    return this.getProcessor(ctx).createWithResponse("Timer", args, info);
  }

  TimerResponse() {

    return {
      data: (source, args, ctx, info) => {

        const {
          id,
        } = source.data || {};

        return id ? ctx.db.query.timer({
          where: {
            id,
          },
        }, info) : null;
      }
    }
  }

}


export default TimerModule;