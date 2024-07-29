const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConfig");

const Favourite = sequelize.define(
  "favourite-msmes",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    businessId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
  },
  {
    timestamps: false,
  }
);

module.exports = Favourite;
