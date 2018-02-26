'use strict';
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('Users', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      required: true
    },
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    role: {
      type: DataTypes.ENUM,
      values: ['user', 'admin', 'disabled']
    },
    password_hash: DataTypes.STRING,
    created_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updated_at:  DataTypes.DATE,
    deleted_at: DataTypes.DATE
  }, {
    underscored: true
  });

  return User;
};
