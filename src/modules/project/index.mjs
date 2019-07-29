

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


  prepareQueryArgs(args, ctx) {

    let {
      where,
    } = args;


    let condition = this.prepareAccesibleQuery(ctx);

    if (condition) {

      if (where) {

        where = {
          // condition,
          AND: [
            condition,
            where,
          ],
        };

      }
      else {
        where = condition;
      }

    }

    // console.log("where", JSON.stringify(where, true, 2));


    return where;

  }


  /**
   * Получать можно только публичные проекты или те, в которых состоит пользователь
   */
  prepareAccesibleQuery(ctx) {

    const {
      currentUser,
    } = ctx;

    const {
      id: currentUserId,
      sudo,
    } = currentUser || {};

    let where;

    if (!sudo) {

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


      where = {
        OR,
      };

    }

    return where;

  }



  addQueryConditions(args, ctx, info) {

    const {
      modifyArgs,
    } = ctx;

    const {
      where,
    } = args;

    modifyArgs(where, this.injectSearchWhere, info);

    modifyArgs(where, this.injectActiveOnlyWhere, info);

    // console.log("where", JSON.stringify(where, true, 2));
  }




  injectSearchWhere(where) {

    let {
      search,
      ...other
    } = where || {};


    let condition;


    if (search !== undefined) {

      delete where.search;


      if (search) {

        let sequence;

        let searchNumber = parseInt(search);

        if (searchNumber && String(searchNumber).length === search.length) {
          sequence = searchNumber;
        }

        let OR = [
          {
            name_contains: search,
          },
          {
            contentText_contains: search,
          },
          {
            Customers_some: {
              name_contains: search,
            },
          },
          {
            CreatedBy: {
              OR: [
                {
                  username_contains: search,
                },
                {
                  fullname_contains: search,
                },
              ],
            },
          },
        ];

        if (sequence) {
          OR.push({
            sequence,
          });
        }

        condition = {
          OR,
        }

      }

    }


    if (condition) {

      /**
       * Если объект условия пустой, то во избежание лишней вложенности
       * присваиваем ему полученное условие
       */
      if (!Object.keys(where).length) {

        Object.assign(where, condition);

      }

      /**
       * Иначе нам надо добавить полученное условие в массив AND,
       * чтобы объединить с другими условиями
       */
      else {

        if (!where.AND) {

          where.AND = [];

        }

        where.AND.push(condition);

      }

    }

    return where;

  }


  injectActiveOnlyWhere(where) {

    let {
      active_only,
      ...other
    } = where || {};


    let condition;


    if (active_only !== undefined) {

      delete where.active_only;


      if (active_only) {

        condition = {
          status_not_in: [
            "Rejected",
            "Completed",
          ],
        }

      }

    }


    if (condition) {

      /**
       * Если объект условия пустой, то во избежание лишней вложенности
       * присваиваем ему полученное условие
       */
      if (!Object.keys(where).length) {

        Object.assign(where, condition);

      }

      /**
       * Иначе нам надо добавить полученное условие в массив AND,
       * чтобы объединить с другими условиями
       */
      else {

        if (!where.AND) {

          where.AND = [];

        }

        where.AND.push(condition);

      }

    }

    return where;

  }



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

    this.addQueryConditions(args, ctx, info);

    return ctx.db.query.projects(args, info);
  }


  projectsConnection(source, args, ctx, info) {

    Object.assign(args, {
      where: this.prepareQueryArgs(args, ctx),
    });

    // console.log("args.where", JSON.stringify(args.where, true, 2));


    this.addQueryConditions(args, ctx, info);

    return ctx.db.query.projectsConnection(args, info);
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