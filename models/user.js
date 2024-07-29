const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConfig");

const User = sequelize.define(
    "users",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
          },

        firstName: {
            type: DataTypes.STRING,
            allowNull: false
          },
          lastName: {
            type: DataTypes.STRING,
            allowNull: false
          },
          email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true
              }
          },
          password: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          profileImage: {
            type: DataTypes.TEXT('long'), 
            allowNull: true,
          },
          role: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "User",
          },
          verified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
          }
    },{
        timestamps: false 
      }
);

module.exports = User;