'use strict';
var MaxFields = require('../router/Validator.js').MaxFields;

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Queue', [{
      name: "Queue 1",
      owner: 1,
      private: false,
      password: null,
      cur_members: 1,
      max_members: MaxFields.QUEUE_MEMBERS,
      cur_songs: 0,
      max_songs: MaxFields.QUEUE_SONGS,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Queue 2",
      owner: 2,
      private: false,
      password: "password",
      cur_members: 1,
      max_members: MaxFields.QUEUE_MEMBERS,
      cur_songs: 0,
      max_songs: MaxFields.QUEUE_SONGS,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.bulkDelete('Queue', null, {});
  }
};
