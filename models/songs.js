'use strict';
module.exports = (sequelize, DataTypes) => {
  var Songs = sequelize.define('Songs', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    queue_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    votes: DataTypes.INTEGER,
    spotify_uri: {
      type: DataTypes.STRING
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {});
  Songs.associate = function(models) {

  };
  return Songs;
};
