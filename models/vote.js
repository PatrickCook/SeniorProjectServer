'use strict';
module.exports = (sequelize, DataTypes) => {
   var Vote = sequelize.define('Vote', {}, {});

   Vote.associate = function(models) {
      Vote.removeAttribute("id")

      Vote.belongsTo(models.song, {
         onDelete: 'CASCADE',
         primaryKey: true,
         foreignKey: {
            allowNull: false,
            primaryKey: true
         }
      });

      Vote.belongsTo(models.user, {
         onDelete: 'CASCADE',
         primaryKey: true,
         foreignKey: {
            allowNull: false,
            primaryKey: true
         }
      });
   };

   return Vote;
};
