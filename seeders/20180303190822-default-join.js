'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    var date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    return queryInterface.sequelize.query(
      `INSERT INTO UserQueue ` +
      `VALUES ('${date}', '${date}', 1,1),` +
              `('${date}', '${date}', 2,2),` +
              `('${date}', '${date}', 1,2),` +
              `('${date}', '${date}', 2,1)`
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      "TRUNCATE TABLE UserQueue"
    );
  }
};
