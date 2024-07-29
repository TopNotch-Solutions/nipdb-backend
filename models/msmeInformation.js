const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConfig");
const MsmeFounderInfo = require("./msmeFounder");
const MsmeContactInfo = require("./msmeContactInfo");
const MsmeAdditionalInfo = require("./msmeAdditionalInfo");
const BusinessHour = require("./businessHour");

const MsmeInformation = sequelize.define(
    "msme-informations",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
          },

          businessRegistrationName: {
            type: DataTypes.STRING,
            allowNull: false
          },
          businessRegistrationNumber: {
            type: DataTypes.STRING,
            allowNull: true
          },
          businessDisplayName: {
            type: DataTypes.STRING,
            allowNull: false
          },
          typeOfBusiness: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          description: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          region: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          town: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          primaryIndustry: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          secondaryIndustry: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          yearOfEstablishment: {
            type: DataTypes.DATE,
            allowNull: false,
          },
          annualTurnover:{
            type: DataTypes.STRING,
            allowNull: false,
          },
          isVisibility: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true, 
          },
          isBlocked: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false, 
          },
          status: {
            type: DataTypes.ENUM,
            values: ['Approved', 'Pending', 'Rejected'],
            allowNull: false,
            defaultValue: 'Pending',
            validate: {
              isIn: {
                args: [['Approved', 'Pending', 'Rejected']],
                msg: "Status must be either 'Approved', 'Pending' or 'Rejected'"
              }
            }
          },
          userId: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          createdAt:{
            type: DataTypes.DATE,
            defaultValue: Date.now(),
            allowNull: false
          }
          
    },{
        timestamps: false
      }
);
MsmeInformation.hasOne(MsmeFounderInfo, { as: 'founderInfo', foreignKey: 'businessId' });
MsmeInformation.hasOne(MsmeContactInfo, { as: 'contactInfo', foreignKey: 'businessId' });
MsmeInformation.hasOne(MsmeAdditionalInfo, { as: 'additionalInfo', foreignKey: 'businessId' });
MsmeInformation.hasOne(BusinessHour, {as: 'businessHours', foreignKey: 'businessId'});

MsmeFounderInfo.belongsTo(MsmeInformation, { foreignKey: 'businessId' });
MsmeContactInfo.belongsTo(MsmeInformation, { foreignKey: 'businessId' });
MsmeAdditionalInfo.belongsTo(MsmeInformation, { foreignKey: 'businessId' });
BusinessHour.belongsTo(MsmeInformation, { foreignKey: 'businessId' })

module.exports = MsmeInformation;