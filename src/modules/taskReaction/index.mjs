

import chalk from "chalk";

import PrismaModule from "@prisma-cms/prisma-module";
import PrismaProcessor from "@prisma-cms/prisma-processor";


export class TaskReactionProcessor extends PrismaProcessor {

  constructor(props) {

    super(props);

    this.objectType = "TaskReaction";

    this.private = true;

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


    if (!this.hasErrors()) {

      /**
       * Проверяем уникальность
       */
      await this.checkUniqueOnCreate({
        ...args,
        ...this.getCreatedBy(),
      });


      return super.create(method, args, info);

    }
  }


  async mutate(method, args, info) {

    let {
      data: {
        // name,
        ...data
      },
    } = args;


    // if(name !== undefined){
    //   name = name && name.trim() || null;

    //   if(!name){
    //     this.addFieldError("name", "Не указано название задачи");
    //   }
    // }


    Object.assign(data, {
      // name,
    });


    Object.assign(args, {
      data,
    });

    return super.mutate(method, args);
  }



  /**
   * Проверяем уникальность
   */
  async checkUniqueOnCreate(args) {

    const {
      data: {
        Task,
        CreatedBy: User,
        type,
      },
    } = args;

    // console.log("checkUniqueOnCreate", args);

    // console.log("checkUniqueOnCreate User", User);

    const {
      db,
    } = this.ctx;

    const {
      connect: taskWhere,
    } = Task || {};

    const {
      connect: userWhere,
    } = User || {};

    if (!taskWhere) {
      return this.addError("Не было получено условие проверки задачи");
    }

    if (!userWhere) {
      return this.addError("Не было получено условие проверки пользователя");
    }

    const exists = await db.exists.TaskReaction({
      Task: {
        ...taskWhere,
      },
      CreatedBy: {
        ...userWhere,
      },
      type,
    });

    // console.log("exists", exists);

    if (exists) {
      this.addError("Уже есть голос за эту задачу");
    }

  }


  async deleteTaskReaction(args, info) {

    const {
      id: currentUserId,
    } = await this.getUser(true);

    // console.log("currentUserId", currentUserId);

    const {
      ctx: {
        db,
      },
    } = this;

    const taskReaction = await db.query.taskReaction(args, `
      {
        id
        CreatedBy {
          id
        }
      }
    `);

    if (!taskReaction) {
      throw new Error("Не был получен объект");
    }

    const {
      CreatedBy: {
        id: userId,
      }
    } = taskReaction;

    if (userId !== currentUserId) {
      throw new Error("Нельзя удалить чужой объект");
    }

    return await db.mutation.deleteTaskReaction(args, info);

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



class TaskReactionModule extends PrismaModule {


  getResolvers() {

    const resolvers = super.getResolvers();


    Object.assign(resolvers.Query, {
      taskReaction: this.taskReaction,
      taskReactions: this.taskReactions,
      taskReactionsConnection: this.taskReactionsConnection,
    });


    Object.assign(resolvers.Mutation, {
      createTaskReactionProcessor: this.createTaskReactionProcessor.bind(this),
      updateTaskReactionProcessor: this.updateTaskReactionProcessor.bind(this),
      deleteTaskReaction: this.deleteTaskReaction.bind(this),
    });

    // Object.assign(resolvers.Subscription, this.Subscription);


    Object.assign(resolvers, {
      TaskReactionResponse: this.TaskReactionResponse(),

      Subscription: {
        taskReaction: {
          subscribe: async (parent, args, ctx, info) => {

            return ctx.db.subscription.taskReaction({}, info);
          },
        },
      },
    });

    return resolvers;
  }


  taskReactions(source, args, ctx, info) {
    return ctx.db.query.taskReactions(args, info);
  }

  taskReaction(source, args, ctx, info) {
    return ctx.db.query.taskReaction(args, info);
  }

  taskReactionsConnection(source, args, ctx, info) {
    return ctx.db.query.taskReactionsConnection(args, info);
  }


  getProcessor(ctx) {
    return new (this.getProcessorClass())(ctx);
  }

  getProcessorClass() {
    return TaskReactionProcessor;
  }

  createTaskReactionProcessor(source, args, ctx, info) {

    return this.getProcessor(ctx).createWithResponse("TaskReaction", args, info);
  }

  updateTaskReactionProcessor(source, args, ctx, info) {

    return this.getProcessor(ctx).updateWithResponse("TaskReaction", args, info);
  }

  deleteTaskReaction(source, args, ctx, info) {

    return this.getProcessor(ctx).deleteTaskReaction(args, info);
  }

  TaskReactionResponse() {

    return {
      data: (source, args, ctx, info) => {

        const {
          id,
        } = source.data || {};

        return id ? ctx.db.query.taskReaction({
          where: {
            id,
          },
        }, info) : null;
      }
    }
  }

}


export default TaskReactionModule;