
import expect from 'expect'

import chalk from "chalk";

import {
  verifySchema,
} from "../../default/schema.test.mjs";

import TestModule from "../../../";


import mocha from 'mocha'
const { describe, it } = mocha

const module = new TestModule();


/**
 */

const requiredTypes = [
  {
    name: "User",
    fields: {
      both: [
        "id",
        "Teams",
        "TeamsCreated",
        "Projects",
        "ProjectsCreated",
        "Timers",
      ],
      prisma: [
      ],
      api: [
      ],
    },
  },
  {
    name: "Team",
    fields: {
      both: [
        "id",
        "name",
        "Parent",
        "Childs",
        "Members",
        "CreatedBy",
      ],
      prisma: [
      ],
      api: [
      ],
    },
  },
  {
    name: "TeamMember",
    fields: {
      both: [
        "id",
        "Team",
        "User",
        // "Posts",
        "CreatedBy",
        "status",
      ],
      prisma: [
      ],
      api: [
      ],
    },
  },
  {
    name: "Service",
    fields: {
      both: [
        "id",
        "name",
        "CreatedBy",
      ],
      prisma: [
      ],
      api: [
      ],
    },
  },
  // {
  //   name: "Post",
  //   fields: {
  //     both: [
  //       "id",
  //       "name",
  //       "CreatedBy",
  //     ],
  //     prisma: [
  //     ],
  //     api: [
  //     ],
  //   },
  // },
  {
    name: "Project",
    fields: {
      both: [
        "id",
        "name",
        "CreatedBy",
        "Tasks",
        "Members",
        // "Teams",
      ],
      prisma: [
      ],
      api: [
      ],
    },
  },
  {
    name: "ProjectMember",
    fields: {
      both: [
        "id",
        "CreatedBy",
        "Project",
        "User",
        // "Post",
        "Service",
        "status",
      ],
      prisma: [
      ],
      api: [
      ],
    },
  },
  {
    name: "Task",
    fields: {
      both: [
        "id",
        "CreatedBy",
        "status",
        "Project",
        "Parent",
        "Childs",
        "RelatedTo",
        "RelatedFrom",
        "startDatePlaning",
        "endDatePlaning",
        "startDate",
        "endDate",
        "Timers",
        "Members",
      ],
      prisma: [
      ],
      api: [
      ],
    },
  },
  {
    name: "TaskMember",
    fields: {
      both: [
        "id",
        "CreatedBy",
        "Task",
        "User",
        "status",
      ],
      prisma: [
      ],
      api: [
      ],
    },
  },
  {
    name: "Timer",
    fields: {
      both: [
        "id",
        "CreatedBy",
        "Task",
        "createdAt",
        "stopedAt",
      ],
      prisma: [
      ],
      api: [
      ],
    },
  },
]


describe('Cooperation Verify prisma Schema', () => {

  verifySchema(module.getSchema(), requiredTypes);

});


// describe('modxclub Verify API Schema', () => {

//   verifySchema(module.getApiSchema(), requiredTypes);

// });