

// import chalk from 'chalk'

import PrismaModule from '@prisma-cms/prisma-module'
import PrismaProcessor from '@prisma-cms/prisma-processor'


export class TaskProcessor extends PrismaProcessor {
  constructor(props) {
    super(props)

    this.objectType = 'Task'

    this.private = true
    this.ownable = true;
  }


  async create(method, args, info) {

    const {
      currentUser,
    } = this.ctx;

    const {
      id: currentUserId,
    } = currentUser || {};

    const {
      data: {
        Project,
        ...data
      },
    } = args

    if (Project) {

      Object.assign(data, {
        TaskProjects: {
          create: {
            Project,
            CreatedBy: {
              connect: {
                id: currentUserId,
              },
            },
          },
        },
      });

    }

    // Object.assign(data, {
    //   ...this.getCreatedBy(),
    // })


    Object.assign(args, {
      data,
    })


    return super.create(method, args, info)
  }


  async mutate(method, args, info) {

    // console.log('TaskProcessor args', JSON.stringify(args, true, 2));

    let {
      data: {
        name,
        ...data
      },
    } = args


    if (name !== undefined) {
      name = (name && name.trim()) || null

      if (!name) {
        this.addFieldError('name', 'Не указано название задачи')
      }
    }


    Object.assign(data, {
      name,
    })


    Object.assign(args, {
      data,
    })

    return super.mutate(method, args)
  }



  // getCreatedBy() {
  //   const {
  //     currentUser,
  //   } = this.ctx

  //   if (!currentUser) {
  //     this.addError('Необходимо авторизоваться')
  //     return
  //   }

  //   const {
  //     id,
  //   } = currentUser

  //   return {
  //     CreatedBy: {
  //       connect: {
  //         id,
  //       },
  //     },
  //   }
  // }
}



class TaskModule extends PrismaModule {
  getResolvers() {
    const resolvers = super.getResolvers()


    Object.assign(resolvers.Query, {
      task: this.task,
      tasks: this.tasks,
      tasksConnection: this.tasksConnection,
    })


    Object.assign(resolvers.Mutation, {
      createTaskProcessor: this.createTaskProcessor.bind(this),
      updateTaskProcessor: this.updateTaskProcessor.bind(this),
    })

    // Object.assign(resolvers.Subscription, this.Subscription);


    Object.assign(resolvers, {
      TaskResponse: this.TaskResponse(),

      Subscription: {
        task: {
          subscribe: async (parent, args, ctx, info) => {
            return ctx.db.subscription.task({}, info)
          },
        },
      },
    })

    return resolvers
  }


  tasks(source, args, ctx, info) {
    return ctx.db.query.tasks(args, info)
  }

  task(source, args, ctx, info) {
    return ctx.db.query.task(args, info)
  }

  tasksConnection(source, args, ctx, info) {
    return ctx.db.query.tasksConnection(args, info)
  }


  getProcessor(ctx) {
    return new (this.getProcessorClass())(ctx)
  }

  getProcessorClass() {
    return TaskProcessor
  }

  createTaskProcessor(source, args, ctx, info) {
    return this.getProcessor(ctx).createWithResponse('Task', args, info)
  }

  updateTaskProcessor(source, args, ctx, info) {
    return this.getProcessor(ctx).updateWithResponse('Task', args, info)
  }

  TaskResponse() {
    return {
      data: (source, args, ctx, info) => {
        const {
          id,
        } = source.data || {}

        return id ? ctx.db.query.task({
          where: {
            id,
          },
        }, info) : null
      }
    }
  }
}


export default TaskModule
