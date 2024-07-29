const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConfig");

const Opportunity = sequelize.define(
  "opportunities",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user: {
        type: DataTypes.ENUM,
        values: ['General User', 'Business User'],
        allowNull: false,
        validate: {
          isIn: {
            args: [['General User', 'Business User']],
            msg: "Type of user must be either 'General User' or 'Business User'"
          }
        }
      },
      dateUploaded: {
        type: DataTypes.DATE,
        allowNull: false,
      },
  },
  {
    timestamps: false,
  }
);

module.exports = Opportunity;
