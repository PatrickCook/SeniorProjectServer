'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('User', [{
      username: "admin",
      first_name: "-",
      last_name: "-",
      role: "admin",
      password_hash: "password",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      username: "pcook",
      first_name: "Patrick",
      last_name: "Cook",
      role: "user",
      password_hash: "password",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      username: "castout",
      first_name: "No",
      last_name: "Permission",
      role: "user",
      password_hash: "password",
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('User', null, {});
  }
};
