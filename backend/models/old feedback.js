'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Feedback extends Model {
    static associate(models) {
      Feedback.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Feedback.belongsTo(models.Recommendation, { foreignKey: 'recommendationId', as: 'recommendation' });
    }
  }
  Feedback.init(
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
      recommendationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Recommendations',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      comment: {
        type: DataTypes.TEXT,
        validate: {
          len: [0, 1000],
        },
      },
    },
    {
      sequelize,
      modelName: 'Feedback',
    }
  );
  return Feedback;
};
