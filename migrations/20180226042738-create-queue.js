'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Queues', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      cur_members: {
        type: Sequelize.INT
      },
      max_members: {
        type: Sequelize.INT
      },
      cur_songs: {
        type: Sequelize.INT
      },
      max_songs: {
        type: Sequelize.INT
      },
      private: {
        type: Sequelize.INT
      },
      password: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Queues');
  }
};