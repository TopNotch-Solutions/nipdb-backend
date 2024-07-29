const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConfig");

const PrimaryIndustry = sequelize.define(
  "primary-industries",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    industryName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    industryIcon: {
        type: DataTypes.TEXT('long'), 
        allowNull: true,
      },
  },
  {
    timestamps: false,
  }
);

module.exports = PrimaryIndustry;