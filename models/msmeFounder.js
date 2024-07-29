const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConfig");

const MsmeFounderInfo = sequelize.define(
    "msme-founder-informations",
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
          founderName: {
            type: DataTypes.STRING,
            allowNull: false
          },
          founderAge: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          founderGender: {
            type: DataTypes.ENUM,
            values: ['Male', 'Female'],
            allowNull: false,
            validate: {
              isIn: {
                args: [['Male', 'Female']],
                msg: "Status must be either 'Male' or 'Female'"
              }
            }
          }  
    },{
        timestamps: false 
      }
);

module.exports = MsmeFounderInfo;