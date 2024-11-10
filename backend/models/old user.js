'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Recommendation, { foreignKey: 'userId', as: 'recommendations' });
      User.hasMany(models.Feedback, { foreignKey: 'userId', as: 'feedbacks' });
    }
  }
  User.init(
    {
      auth0Id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
    }
  );
  return User;
};
