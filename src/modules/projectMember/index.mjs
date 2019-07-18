

import chalk from "chalk";

import PrismaModule from "@prisma-cms/prisma-module";
import PrismaProcessor from "@prisma-cms/prisma-processor";


export class ProjectMemberProcessor extends PrismaProcessor {

  constructor(props) {

    super(props);

    this.objectType = "ProjectMember";

    this.private = true;

  }


  /**
   * Создание связки Пользователь-Проект выполняется через процессор обновления проекта, 
   * чтобы выполнялась проверка прав на обновление проекта.
   */
  async create(method, args, info) {

    let {
      data: {
        Project,
        ...data
      },
    } = args;


    const CreatedBy = this.getCreatedBy();


    if (!CreatedBy) {
      return;
    };

    const {
      db,
      currentUser,
      resolvers: {
        Mutation: {
          updateProjectProcessor,
        },
      },
    } = this.ctx;

    const {
      id: currentUserId,
    } = currentUser;

    /**
     * Проверяем уникальность
     */
    const exist = await this.checkUniqueOnCreate(args);

    if (exist) {
      return exist;
    }


    if (!this.hasErrors()) {

      const {
        connect: projectWhere,
      } = Project;


      Object.assign(data, {
        ...CreatedBy,
      });


      Object.assign(args, {
        data,
      });

      const updateProjectResult = await updateProjectProcessor(null, {
        data: {
          Members: {
            create: [data],
          },
        },
        where: projectWhere,
      }, this.ctx);

      const {
        success,
        message,
        errors,
        data: project,
      } = updateProjectResult;

      // console.log("updateProjectProcessor result", updateProjectResult);

      if (!success || !project) {

        Object.assign(this, {
          message,
          errors: this.errors.concat(errors || []),
        });

        return false;
      }
      else {

        /**
         * Если проект успешно обновили, то возвращаем последнюю созданную запись
         */

        const projectMembers = await db.query.projectMembers({
          first: 1,
          orderBy: "createdAt_DESC",
          where: {
            Project: projectWhere,
          },
        });

        const projectMember = projectMembers ? projectMembers[0] : null;

        // console.log("updateProjectProcessor projectMembers", projectMembers);
        // console.log("updateProjectProcessor projectMember", projectMember);

        return projectMember;

      }

    }




    return null;

    // return super.create(method, args, info);
  }


  // async create(method, args, info) {

  //   let {
  //     data: {
  //       ...data
  //     },
  //   } = args;


  //   const CreatedBy = this.getCreatedBy();


  //   if (!CreatedBy) {
  //     return;
  //   }

  //   const {
  //     db,
  //     currentUser,
  //   } = this.ctx;

  //   const {
  //     id: currentUserId,
  //   } = currentUser;


  //   /**
  //    * Проверяем уникальность
  //    */
  //   const exist = await this.checkUniqueOnCreate(args);

  //   if (exist) {
  //     return exist;
  //   }


  //   Object.assign(data, {
  //     ...CreatedBy,
  //   });


  //   Object.assign(args, {
  //     data,
  //   });


  //   return null;

  //   // return super.create(method, args, info);
  // }






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

    // console.log("mutate args", args);

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
        Project,
        User,
      },
    } = args;

    const {
      db,
    } = this.ctx;

    const {
      connect: projectWhere,
    } = Project || {};

    const {
      connect: userWhere,
    } = User || {};

    if (!projectWhere) {
      // return this.addError("Не было получено условие проверки компании");
      throw new Error("Не было получено условие проверки компании");
    }

    if (!userWhere) {
      // return this.addError("Не было получено условие проверки пользователя");
      throw new Error("Не было получено условие проверки пользователя");
    }

    // const projectMembers = await db.query.projectMembers({
    //   where: {
    //     Project: {
    //       ...projectWhere,
    //     },
    //     User: {
    //       ...userWhere,
    //     },
    //   },
    //   first: 1,
    // });

    // return projectMembers ? projectMembers[0] : null;

    // console.log("exists", exists);

    const exists = await db.exists.ProjectMember({
      Project: {
        ...projectWhere,
      },
      User: {
        ...userWhere,
      },
    });

    // console.log("exists", exists);

    if (exists) {
      throw new Error("Пользователь уже есть в этом проекте");
    }

    return exists;
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