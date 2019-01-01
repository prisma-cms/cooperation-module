 

import chalk from "chalk";

import PrismaModule from "@prisma-cms/prisma-module";
import PrismaProcessor from "@prisma-cms/prisma-processor";
  

export class ServiceProcessor extends PrismaProcessor {

  constructor(props) {

    super(props);

    this.objectType = "Service";

  }


  async create(method, args, info) {

    let {
      data: {
        ...data
      },
    } = args;


    Object.assign(data, {
      ...this.getCreatedBy(),
    });


    Object.assign(args, {
      data,
    });


    return super.create(method, args, info);
  }


  async mutate(method, args, info) {

    let {
      data: {
        name,
        ...data
      },
    } = args;


    if(name !== undefined){
      name = name && name.trim() || null;

      if(!name){
        this.addFieldError("name", "Не указано название услуги");
      }
    }


    Object.assign(data, {
      name,
    });


    Object.assign(args, {
      data,
    });

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



class ServiceModule extends PrismaModule {


  getResolvers() {

    const resolvers = super.getResolvers();


    Object.assign(resolvers.Query, {
      service: this.service,
      services: this.services,
      servicesConnection: this.servicesConnection,
    });


    Object.assign(resolvers.Mutation, {
      createServiceProcessor: this.createServiceProcessor.bind(this),
      updateServiceProcessor: this.updateServiceProcessor.bind(this),
    });

    // Object.assign(resolvers.Subscription, this.Subscription);


    Object.assign(resolvers, {
      ServiceResponse: this.ServiceResponse(),
    });

    return resolvers;
  }


  services(source, args, ctx, info) {
    return ctx.db.query.services(args, info);
  }

  service(source, args, ctx, info) {
    return ctx.db.query.service(args, info);
  }

  servicesConnection(source, args, ctx, info) {
    return ctx.db.query.servicesConnection(args, info);
  }


  getProcessor(ctx) {
    return new (this.getProcessorClass())(ctx);
  }

  getProcessorClass() {
    return ServiceProcessor;
  }

  createServiceProcessor(source, args, ctx, info) {

    return this.getProcessor(ctx).createWithResponse("Service", args, info);
  }

  updateServiceProcessor(source, args, ctx, info) {

    return this.getProcessor(ctx).updateWithResponse("Service", args, info);
  }

  ServiceResponse() {

    return {
      data: (source, args, ctx, info) => {

        const {
          id,
        } = source.data || {};

        return id ? ctx.db.query.service({
          where: {
            id,
          },
        }, info) : null;
      }
    }
  }

}


export default ServiceModule;