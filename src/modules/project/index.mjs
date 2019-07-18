

import chalk from "chalk";

import PrismaModule from "@prisma-cms/prisma-module";
import PrismaProcessor from "@prisma-cms/prisma-processor";

import URI from "urijs";

export class ProjectProcessor extends PrismaProcessor {

  constructor(props) {

    super(props);

    this.objectType = "Project";

    this.private = true;

  }


  async create(method, args, info) {

    const {
      db,
    } = this.ctx;

    let {
      data: {
        ...data
      },
    } = args;

    const lastObject = await db.query.projects({
      orderBy: "sequence_DESC",
      first: 1,
    });


    const sequence = (lastObject && lastObject[0] && lastObject[0].sequence || 0) + 1;

    Object.assign(data, {
      sequence,
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
        url,
        domain,
        ...data
      },
    } = args;


    if (name !== undefined) {
      name = name && name.trim() || null;

      if (!name) {
        this.addFieldError("name", "Не указано название проекта");
      }
    }


    /**
     * Если меняется УРЛ, то меняем и домен
     */
    if (url !== undefined) {

      if (url) {

        const uri = new URI(url);

        domain = uri.hostname() || null;

      }
      else {
        domain = null;
      }

    }


    Object.assign(data, {
      name,
      url,
      domain,
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
      project: this.project.bind(this),
      projects: this.projects.bind(this),
      projectsConnection: this.projectsConnection.bind(this),
    });


    Object.assign(resolvers.Mutation, {
      createProjectProcessor: this.createProjectProcessor.bind(this),
      updateProjectProcessor: this.updateProjectProcessor.bind(this),
    });

    // Object.assign(resolvers.Subscription, this.Subscription);


    Object.assign(resolvers, {
      ProjectResponse: this.ProjectResponse(),

      Subscription: {
        project: {
          subscribe: async (parent, args, ctx, info) => {

            return ctx.db.subscription.project({}, info);
          },
        },
      },
    });

    return resolvers;
  }

  async project(source, args, ctx, info) {

    let objects = await this.projects(source, args, ctx, info);

    return objects && objects[0] || null;

    // return ctx.db.query.project(args, info);
  }

  projects(source, args, ctx, info) {

    Object.assign(args, {
      where: this.prepareQueryArgs(args, ctx),
    });

    // console.log("args.where", JSON.stringify(args.where, true, 2));

    return ctx.db.query.projects(args, info);
  }


  projectsConnection(source, args, ctx, info) {

    Object.assign(args, {
      where: this.prepareQueryArgs(args, ctx),
    });

    // console.log("args.where", JSON.stringify(args.where, true, 2));

    return ctx.db.query.projectsConnection(args, info);
  }

  prepareQueryArgs(args, ctx) {

    return this.prepareAccesibleQuery(args, ctx);
  }


  /**
   * Получать можно только публичные проекты или те, в которых состоит пользователь
   */
  prepareAccesibleQuery(args, ctx) {

    let {
      where,
    } = args;

    const {
      currentUser,
    } = ctx;

    const {
      id: currentUserId,
    } = currentUser || {};


    let OR = [
      {
        public: true,
      },
    ];

    if (currentUserId) {

      /**
       * Создатель проекта
       */
      OR.push({
        CreatedBy: {
          id: currentUserId,
        }
      });

      /**
       * Непосредственно участники этого проекта
       */
      OR.push({
        Members_some: {
          User: {
            id: currentUserId,
          },
          status: "Active",
        }
      });

      /**
       * Члены команды-исполнителя
       */
      OR.push({
        Team: {
          OR: [
            {
              CreatedBy: {
                id: currentUserId,
              },
            },
            {
              Members_some: {
                User: {
                  id: currentUserId,
                },
                status: "Active",
              },
            },
          ],
        },
      });

      /**
       * Члены команд-заказчиков
       */
      OR.push({
        Customers_some: {
          OR: [
            {
              CreatedBy: {
                id: currentUserId,
              },
            },
            {
              Members_some: {
                User: {
                  id: currentUserId,
                },
                status: "Active",
              },
            },
          ],
        }
      });

    }


    return {
      OR,
      AND: where ? {
        ...where,
      } : undefined,
    };

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

  updateProjectProcessor(source, args, ctx, info) {

    return this.getProcessor(ctx).updateWithResponse("Project", args, info);
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