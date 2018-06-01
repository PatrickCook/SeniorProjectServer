'use strict';
module.exports = (sequelize, DataTypes) => {
  var Queue = sequelize.define('Queue', {
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
    private: DataTypes.BOOLEAN,
    password: DataTypes.STRING,
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {
    freezeTableName: true
  });

  Queue.associate = function(models) {
    Queue.hasMany(models.song, {
      foreignKey: 'queueId',
      onDelete: 'CASCADE'
    });

    Queue.belongsToMany(models.user, {
      through: 'UserQueue',
      onDelete: 'CASCADE'
    });

    Queue.belongsTo(models.user, {
      foreignKey: 'owner'
    });
  };

  return Queue;
};
