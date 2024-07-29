const MsmeInformation = require("../../models/msmeInformation");
const MsmeFounderInfo = require("../../models/msmeFounder");
const MsmeContactInfo = require("../../models/msmeContactInfo");
const MsmeAdditionalInfo = require("../../models/msmeAdditionalInfo");
const User = require("../../models/user");
const { where } = require("sequelize");
const AdminNotification = require("../../models/adminNotifications");
const Admin = require("../../models/admin");
const Notification = require("../../models/notification");
const CapitalizeFirstLetter = require("../../utils/shared/capitalizeFirstLetter");
const BusinessHour = require("../../models/businessHour");
const PrimaryIndustry = require("../../models/primaryIndustry");
exports.create = async (req, res) => {
  try {
    console.log(req.body);
    let {
      businessRegistrationName,
      businessRegistrationNumber,
      businessDisplayName,
      typeOfBusiness,
      description,
      region,
      town,
      userId,
      primaryIndustry,
      secondaryIndustry,
      yearOfEstablishment,
      annualTurnover,
      founderName,
      founderAge,
      founderGender,
      businessAddress,
      phoneNumber,
      whatsAppNumber,
      email,
      website,
      twitter,
      facebook,
      instagram,
      linkedIn,
      numberOfEmployees,
      businessLogo,
      image1,
      image2,
      image3,
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      sunday,
    } = req.body;

    const requiredFields = [
      "businessRegistrationName",
      "businessDisplayName",
      "typeOfBusiness",
      "description",
      "region",
      "town",
      "primaryIndustry",
      "yearOfEstablishment",
      "annualTurnover",
      "founderName",
      "founderAge",
      "founderGender",
      "businessAddress",
      "monday",
      "tuesday",
      "wednesday",
      "userId",
      "friday",
      "saturday",
      "sunday",
      "phoneNumber",
      "email",
    ];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          status: "FAILURE",
          message: `${field} is required.`,
        });
      }
    }
    businessRegistrationName = CapitalizeFirstLetter(businessRegistrationName);
    businessDisplayName = CapitalizeFirstLetter(businessDisplayName);
    typeOfBusiness = CapitalizeFirstLetter(typeOfBusiness);
    description = CapitalizeFirstLetter(description);
    region = CapitalizeFirstLetter(region);
    town = CapitalizeFirstLetter(town);
    primaryIndustry = CapitalizeFirstLetter(primaryIndustry);
    secondaryIndustry = CapitalizeFirstLetter(secondaryIndustry);
    founderName = CapitalizeFirstLetter(founderName);
    founderGender = CapitalizeFirstLetter(founderGender);
    businessAddress = CapitalizeFirstLetter(businessAddress);

    const checkExistingUser = await User.findOne({ where: { id: userId} });
    if (!checkExistingUser) {
      return res.status(404).json({
        status: "FAILURE",
        message:
          "The user you are trying to insert into the database does not exist.",
      });
    }

    if (checkExistingUser.role !== "User") {
      return res.status(400).json({
        status: "FAILURE",
        message: "User does not have access to this route.",
      });
    }

    const alreadyExist = await MsmeInformation.findOne({
      where: { businessRegistrationName },
    });
    if (alreadyExist) {
      return res.status(404).json({
        status: "FAILURE",
        message: "Business name already in use.",
      });
    }

    const newInformation = await MsmeInformation.create({
      businessRegistrationName,
      businessDisplayName,
      businessAddress,
      typeOfBusiness,
      description,
      region,
      town,
      businessRegistrationNumber,
      primaryIndustry,
      secondaryIndustry,
      yearOfEstablishment,
      annualTurnover,
      userId,
    });

    const newFounder = await MsmeFounderInfo.create({
      businessId: newInformation.id,
      founderName,
      founderAge,
      founderGender,
    });

    const newContact = await MsmeContactInfo.create({
      businessId: newInformation.id,
      businessAddress,
      phoneNumber,
      whatsAppNumber,
      email,
      website,
      twitter,
      facebook,
      instagram,
      linkedIn,
    });

    if(!businessLogo){
      const businessIcon = await PrimaryIndustry.findOne({
        where:{
          industryName:primaryIndustry
        }
      });
      const newAdditional = await MsmeAdditionalInfo.create({
        businessId: newInformation.id,
        numberOfEmployees,
        businessLogo: businessIcon.industryIcon,
        image1,
        image2,
        image3,
      });
    }else{
      const newAdditional = await MsmeAdditionalInfo.create({
        businessId: newInformation.id,
        numberOfEmployees,
        businessLogo,
        image1,
        image2,
        image3,
      });
    }
   
      const businessHour = await BusinessHour.create({
        businessId: newInformation.id,
        monday,
        tuesday,
        wednesday,
        thursday,
        friday,
        saturday,
        sunday,
      });

    const users = await Admin.findAll({
      attributes: ["id"],
    });
    if (!users) {
      return res.status(404).json({
        status: "FAILURE",
        message: "There are no users.",
      });
    }
    const userIds = users.map((user) => user.id);
    const notifications = userIds.map((userId) => ({
      userId,
      notification: "New user has added their business on the system",
      type: "Alert",
      priority: "High",
      createdAt: Date.now(),
      viewed: false,
    }));
    if (!notifications) {
      return res.status(404).json({
        status: "FAILURE",
        message: "An error occured during mapping of data.",
      });
    }
    await AdminNotification.bulkCreate(notifications);
    await Notification.create({
      userId,
      senderId: 8,
      notification: "Your form has been submitted successfully. Admin will review your application and approve or decline your form. Your will be sent a another notification with the status of your application. Onces your application is approved it will be added to the list of your businesses on the msme profile and your business will be visible to all user, remember you can always turn off visibility in your profile settings if you dont want people to see your business",
      type: "Alert",
      priority: "High",
      createdAt: Date.now(),
      viewed: false,
    })
    res.status(201).json({
      status: "SUCCESS",
      message: "Business successfully created!",
    });
  } catch (error) {
    res.status(500).json({
      status: "FAILURE",
      message: "Internal server error: " + error.message,
    });
  }
};
exports.allUser = async (req, res) => {
  try{
    const allUsers = await User.findAll();
    if(!allUsers){
     return res.status(500).json({
        status: "FAILURE",
        message: "Something happened during the procces of retrieving user data!",
      });
    }
    res.status(200).json({
      status: "SUCCESS",
      message: "All MSME information retrieved successfully!",
      data: allUsers,
    });
  } catch (error) {
    res.status(500).json({
      status: "FAILURE",
      message: "Internal server error: " + error.message,
    });
  }
}
exports.all = async (req, res) => {
    try {
      const allMsmeInformations = await MsmeInformation.findAll({
        include: [
          {
            model: MsmeFounderInfo,
            as: "founderInfo",
          },
          {
            model: MsmeContactInfo,
            as: "contactInfo",
          },
          {
            model: MsmeAdditionalInfo,
            as: "additionalInfo",
          },
        ],
      });
      res.status(200).json({
        status: "SUCCESS",
        message: "All MSME information retrieved successfully!",
        data: allMsmeInformations,
      });
    } catch (error) {
      res.status(500).json({
        status: "FAILURE",
        message: "Internal server error: " + error.message,
      });
    }
  };
  exports.single = async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!id) {
        return res.status(400).json({
          status: "FAILURE",
          message: "Empty parameter",
        });
      }
  
      const msmeInformation = await MsmeInformation.findOne({
        where: {
          id,
        },
        include: [
          {
            model: MsmeFounderInfo,
            as: "founderInfo",
          },
          {
            model: MsmeContactInfo,
            as: "contactInfo",
          },
          {
            model: MsmeAdditionalInfo,
            as: "additionalInfo",
          },
        ],
      });
  
      if (!msmeInformation) {
        return res.status(404).json({
          status: "FAILURE",
          message: "MSME information not found",
        });
      }
  
      res.status(200).json({
        status: "SUCCESS",
        message: "MSME information retrieved successfully!",
        data: msmeInformation,
      });
    } catch (error) {
      res.status(500).json({
        status: "FAILURE",
        message: "Internal server error: " + error.message,
      });
    }
  };
  
exports.totalCount = async (req, res) => {
    try{
        const totalCount = await MsmeInformation.count();
        if(!totalCount){
            return res.status(200).json({
                status: "SUCCESS",
                message: "Total count successfully retrieved!",
            count: totalCount,
              });
        }
        res.status(200).json({
            status: "SUCCESS",
            message: "Total count successfully retrieved!",
            count: totalCount,
          });
    } catch (error) {
      res.status(500).json({
        status: "FAILURE",
        message: "Internal server error: " + error.message,
      });
    }
};
exports.pendingCount = async (req, res) => {
    try{
        const totalCount = await MsmeInformation.count({
            where:{
                status: 'Pending'
            }
        });
        console.log(totalCount);
        if(!totalCount){
            return res.status(200).json({
                status: "SUCCESS",
                message: "Pending count successfully retrieved!",
            count: totalCount,
              });
        }
        res.status(200).json({
            status: "SUCCESS",
            message: "Pending count successfully retrieved!",
            count: totalCount,
          });
    } catch (error) {
      res.status(500).json({
        status: "FAILURE",
        message: "Internal server error: " + error.message,
      });
    }
};
exports.rejectedCount = async (req, res) => {
    try{
        const totalCount = await MsmeInformation.count({
            where:{
                status: 'Rejected'
            }
        });
        console.log(totalCount);
        if(!totalCount){
            return res.status(200).json({
                status: "SUCCESS",
                message: "Pending count successfully retrieved!",
            count: totalCount,
              });
        }
        res.status(200).json({
            status: "SUCCESS",
            message: "Rejected count successfully retrieved!",
            count: totalCount,
          });
    } catch (error) {
      res.status(500).json({
        status: "FAILURE",
        message: "Internal server error: " + error.message,
      });
    }
};
exports.approvedCount = async (req, res) => {
    try{
        const totalCount = await MsmeInformation.count({
            where:{
                status: 'Approved'
            }
        });
        if(!totalCount){
            return res.status(200).json({
                status: "SUCCESS",
                message: "Pending count successfully retrieved!",
                count: totalCount,
              });
        }
        res.status(200).json({
            status: "SUCCESS",
            message: "Approved count successfully retrieved!",
            count: totalCount,
          });
    } catch (error) {
      res.status(500).json({
        status: "FAILURE",
        message: "Internal server error: " + error.message,
      });
    }
};
exports.status = async (req, res) => { // send email to user when busness has been approved or rejected
    try{
      const {userId, id} = req.params;
      const {status} = req.body;
      if(!userId || !id || !status){
        return res.status(400).json({
          status: "FAILURE",
          message: "Empty parameter",
        });
      }

      const existingUser = await User.findOne({
        where:{
          id: userId
        }
      });

      if(!existingUser){
        return res.status(404).json({
          status: "FAILURE",
          message: "The user you are trying to access does not exist.",
        });
      }

      const existingBusiness = await MsmeInformation.findOne({
        where:{
          id
        }
      });

      if(!existingBusiness){
        return res.status(404).json({
          status: "FAILURE",
          message: "The business does not exist.",
        });
      }

      await MsmeInformation.update(
        {status},
        {
          where:{
            id
          }
        }
      );
      res.status(200).json({
        status: "SUCCESS",
        message: "Status successfully changed!"
      });
    } catch (error) {
      res.status(500).json({
        status: "FAILURE",
        message: "Internal server error: " + error.message,
      });
    }
};
exports.block = async (req, res) => { //add function to unblock
  try{
    const {userId, id} = req.params;
    const {block} = req.body;
    if(!userId || !id || !block){
      return res.status(400).json({
        status: "FAILURE",
        message: "Empty parameter",
      });
    }

    const existingUser = await User.findOne({
      where:{
        id: userId
      }
    });

    if(!existingUser){
      return res.status(404).json({
        status: "FAILURE",
        message: "The user you are trying to access does not exist.",
      });
    }

    const existingBusiness = await MsmeInformation.findOne({
      where:{
        id
      }
    });

    if(!existingBusiness){
      return res.status(404).json({
        status: "FAILURE",
        message: "The business does not exist.",
      });
    }

    await MsmeInformation.update(
      {isBlocked:block},
      {
        where:{
          id
        }
      }
    );
    res.status(200).json({
      status: "SUCCESS",
      message: "Status successfully changed!"
    });
  } catch (error) {
    res.status(500).json({
      status: "FAILURE",
      message: "Internal server error: " + error.message,
    });
  }
};