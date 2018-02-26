'use strict';
module.exports = (sequelize, DataTypes) => {
  var Song = sequelize.define('Songs', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    queue_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    spotify_uri: DataTypes.STRING,
    votes: DataTypes.INTEGER,
    created_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updated_at:  DataTypes.DATE,
    deleted_at: DataTypes.DATE
  }, {
    underscored: true
  });

  return Song;
};
