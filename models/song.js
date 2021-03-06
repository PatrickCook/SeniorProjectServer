'use strict';
module.exports = (sequelize, DataTypes) => {
  var Song = sequelize.define('Song', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    title: DataTypes.STRING,
    artist: DataTypes.STRING,
    albumURI: DataTypes.STRING,
    previewURI: DataTypes.STRING,
    spotifyURI: DataTypes.STRING,
    isPlaying: {
      allowNul: false,
      type: DataTypes.BOOLEAN
   },
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
  Song.associate = function(models) {
     Song.hasMany(models.vote, {
        as: 'votes',
        onDelete: 'CASCADE',
        foreignKey: {
           allowNull: false,
           primaryKey: true
        }
     });

     Song.belongsTo(models.user, {
        as: 'queuedBy',
        foreignKey: 'owner'
     })
  };
  return Song;
};
