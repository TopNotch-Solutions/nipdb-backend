const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConfig");

const MsmeAdditionalInfo = sequelize.define(
    "msme-additional-informations",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
          },
          businessId: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          numberOfEmployees: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "0"
          },
          businessLogo: {
            type: DataTypes.TEXT('long'), 
            allowNull: true,
          },
          image1: {
            type: DataTypes.TEXT('long'), 
            allowNull: true,
          },
          image2: {
            type: DataTypes.TEXT('long'), 
            allowNull: true,
          },
          image3: {
            type: DataTypes.TEXT('long'), 
            allowNull: true,
          },
    },{
        timestamps: false 
      }
);

module.exports = MsmeAdditionalInfo;