'use strict';
module.exports = (sequelize, DataTypes) => {
  var Queue = sequelize.define('Queues', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
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
    created_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updated_at:  DataTypes.DATE,
    deleted_at: DataTypes.DATE
  }, {
    underscored: true
  });

  return Queue;
};
