

import chalk from "chalk";

import PrismaModule from "@prisma-cms/prisma-module";
import PrismaProcessor from "@prisma-cms/prisma-processor";


export class PositionProcessor extends PrismaProcessor {

  constructor(props) {

    super(props);

    this.objectType = "Position";

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

}



class PositionModule extends PrismaModule {


  getResolvers() {

    const resolvers = super.getResolvers();


    Object.assign(resolvers.Query, {
      position: this.position,
      positions: this.positions,
      positionsConnection: this.positionsConnection,
    });


    Object.assign(resolvers.Mutation, {
      createPositionProcessor: this.createPositionProcessor.bind(this),
      updatePositionProcessor: this.updatePositionProcessor.bind(this),
    });

    // Object.assign(resolvers.Subscription, this.Subscription);


    Object.assign(resolvers, {
      PositionResponse: this.PositionResponse(),
    });

    return resolvers;
  }


  positions(source, args, ctx, info) {
    return ctx.db.query.positions(args, info);
  }

  position(source, args, ctx, info) {
    return ctx.db.query.position(args, info);
  }

  positionsConnection(source, args, ctx, info) {
    return ctx.db.query.positionsConnection(args, info);
  }


  getProcessor(ctx) {
    return new (this.getProcessorClass())(ctx);
  }

  getProcessorClass() {
    return PositionProcessor;
  }

  createPositionProcessor(source, args, ctx, info) {

    return this.getProcessor(ctx).createWithResponse("Position", args, info);
  }

  updatePositionProcessor(source, args, ctx, info) {

    return this.getProcessor(ctx).updateWithResponse("Position", args, info);
  }

  PositionResponse() {

    return {
      data: (source, args, ctx, info) => {

        const {
          id,
        } = source.data || {};

        return id ? ctx.db.query.position({
          where: {
            id,
          },
        }, info) : null;
      }
    }
  }

}


export default PositionModule;