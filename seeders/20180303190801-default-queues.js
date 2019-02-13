'use strict';
var MaxFields = require('../router/Validator.js').MaxFields;

module.exports = {
  up: (queryInterface, Sequelize) => {
    // return queryInterface.bulkInsert('Queue', [{
    //   name: "Queue 1",
    //   owner: 1,
    //   private: false,
    //   password: null,
    //   curMembers: 1,
    //   maxMembers: MaxFields.QUEUE_MEMBERS,
    //   curSongs: 0,
    //   maxSongs: MaxFields.QUEUE_SONGS,
    //   createdAt: new Date(),
    //   updatedAt: new Date()
    // },
    // {
    //   name: "Queue 2",
    //   owner: 2,
    //   private: false,
    //   password: "password",
    //   curMembers: 1,
    //   maxMembers: MaxFields.QUEUE_MEMBERS,
    //   curSongs: 0,
    //   maxSongs: MaxFields.QUEUE_SONGS,
    //   createdAt: new Date(),
    //   updatedAt: new Date()
    // }], {});
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.bulkDelete('Queue', null, {});
  }
};
