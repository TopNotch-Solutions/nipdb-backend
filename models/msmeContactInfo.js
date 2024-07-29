const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConfig");

const MsmeContactInfo = sequelize.define(
    "msme-contact-informations",
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
          businessAddress: {
            type: DataTypes.STRING,
            allowNull: false
          },
          phoneNumber: {
            type: DataTypes.STRING,
            allowNull: false
          },
          whatsAppNumber: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true
              }
          },
          website: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          twitter: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          facebook: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          instagram: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          linkedIn: {
            type: DataTypes.STRING,
            allowNull: true,
          }
    },{
        timestamps: false 
      }
);

module.exports = MsmeContactInfo;