const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConfig");

const BusinessHour = sequelize.define(
    "msme-business-hours",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
          },
          businessId: {
            type: DataTypes.STRING,
            allowNull: false
          },
          monday: {
            type: DataTypes.STRING,
            allowNull: false
          },
          tuesday: {
            type: DataTypes.STRING,
            allowNull: false
          },
        wednesday: {
            type: DataTypes.STRING,
            allowNull: false
          },
          thursday: {
            type: DataTypes.STRING,
            allowNull: false
          },
          friday: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          saturday: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          sunday: {
            type: DataTypes.STRING,
            allowNull: false,
          }
    },{
        timestamps: false 
      }
);

module.exports = BusinessHour;