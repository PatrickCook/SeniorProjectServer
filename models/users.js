'use strict';
module.exports = (sequelize, DataTypes) => {
  var Users = sequelize.define('Users', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    username: {
      type: DataTypes.STRING,
      required: true
    },
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    role: {
      type: DataTypes.ENUM,
      values: ['user', 'admin', 'disabled'],
      required: true
    },
    password_hash: DataTypes.STRING,
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {});
  Users.associate = function(models) {
    // associations can be defined here
  };
  return Users;
};
