'use strict';
module.exports = (sequelize, DataTypes) => {
  var Queues = sequelize.define('Queues', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING,
      required: true
    },
    cur_members: DataTypes.INTEGER,
    max_members: DataTypes.INTEGER,
    cur_songs: DataTypes.INTEGER,
    max_songs: DataTypes.INTEGER,
    private: DataTypes.INTEGER,
    password: DataTypes.STRING,
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {});
  Queues.associate = function(models) {
    // associations can be defined here
  };
  return Queues;
};
