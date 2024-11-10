'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Recommendation extends Model {
    static associate(models) {
      Recommendation.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Recommendation.hasOne(models.Feedback, { foreignKey: 'recommendationId', as: 'feedback' });
    }
  }
  Recommendation.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      gameTitle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      gameDescription: {
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      modelName: 'Recommendation',
    }
  );
  return Recommendation;
};
