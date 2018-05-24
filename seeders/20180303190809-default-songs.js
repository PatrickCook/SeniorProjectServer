'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    // return queryInterface.bulkInsert('Song', [
    //   { spotify_uri: "queue-1-song-1", userId: 1, queueId: 1, createdAt: new Date(), updatedAt: new Date()},
    //   { spotify_uri: "queue-1-song-2", userId: 2, queueId: 1, createdAt: new Date(), updatedAt: new Date()},
    //   { spotify_uri: "queue-2-song-1", userId: 1, queueId: 2, createdAt: new Date(), updatedAt: new Date()},
    //   { spotify_uri: "queue-2-song-2", userId: 2, queueId: 2, createdAt: new Date(), updatedAt: new Date()},
    //   { spotify_uri: "queue-2-song-3", userId: 2, queueId: 2, createdAt: new Date(), updatedAt: new Date()},
    // ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Song', null, {});
  }
};
