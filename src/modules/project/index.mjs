 

import chalk from "chalk";

import PrismaModule from "@prisma-cms/prisma-module";
import PrismaProcessor from "@prisma-cms/prisma-processor";
  

export class ProjectProcessor extends PrismaProcessor {

  constructor(props) {

    super(props);

    this.objectType = "Project";

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
        this.addFieldError("name", "Не указано название проекта");
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



class ProjectModule extends PrismaModule {


  getResolvers() {

    const resolvers = super.getResolvers();


    Object.assign(resolvers.Query, {
      project: this.project,
      projects: this.projects,
      projectsConnection: this.projectsConnection,
    });


    Object.assign(resolvers.Mutation, {
      createProjectProcessor: this.createProjectProcessor.bind(this),
    });

    // Object.assign(resolvers.Subscription, this.Subscription);


    Object.assign(resolvers, {
      ProjectResponse: this.ProjectResponse(),
    });

    return resolvers;
  }


  projects(source, args, ctx, info) {
    return ctx.db.query.projects({}, info);
  }

  project(source, args, ctx, info) {
    return ctx.db.query.project({}, info);
  }

  projectsConnection(source, args, ctx, info) {
    return ctx.db.query.projectsConnection({}, info);
  }


  getProcessor(ctx) {
    return new (this.getProcessorClass())(ctx);
  }

  getProcessorClass() {
    return ProjectProcessor;
  }

  createProjectProcessor(source, args, ctx, info) {

    return this.getProcessor(ctx).createWithResponse("Project", args, info);
  }

  ProjectResponse() {

    return {
      data: (source, args, ctx, info) => {

        const {
          id,
        } = source.data || {};

        return id ? ctx.db.query.project({
          where: {
            id,
          },
        }, info) : null;
      }
    }
  }

}


export default ProjectModule;