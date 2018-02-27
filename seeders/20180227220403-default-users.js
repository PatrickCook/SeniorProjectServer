'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [{
      username: "admin",
      first_name: "Patrick",
      last_name: "Cook",
      role: "admin",
      password_hash: "password",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      username: "pcook01",
      first_name: "Patrick",
      last_name: "Cook",
      role: "user",
      password_hash: "password",
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
