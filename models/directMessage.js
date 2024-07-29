const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConfig");
const User = require("./user");

const Message = sequelize.define(
  "messages",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    recieverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      viewed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      businessId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdAt:{
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Date.now()
      },
  },
  {
    timestamps: false,
  }
);

User.hasMany(Message, {as: 'message' , foreignKey: 'recieverId'});
Message.belongsTo(User,{ foreignKey: 'recieverId'});

module.exports = Message;
