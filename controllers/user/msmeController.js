const MsmeInformation = require("../../models/msmeInformation");
const MsmeFounderInfo = require("../../models/msmeFounder");
const MsmeContactInfo = require("../../models/msmeContactInfo");
const MsmeAdditionalInfo = require("../../models/msmeAdditionalInfo");
const CapitalizeFirstLetter = require("../../utils/shared/capitalizeFirstLetter");
const User = require("../../models/user");
const { where, Op } = require("sequelize");
const Notification = require("../../models/notification");
const Favourite = require("../../models/msmeLike");
const Admin = require("../../models/admin");
const AdminNotification = require("../../models/adminNotifications");
const BusinessHour = require("../../models/businessHour");
const PrimaryIndustry = require("../../models/primaryIndustry");
const SecondaryIndustry = require("../../models/secondaryIndustry");
const Region = require("../../models/region");
const Town = require("../../models/town");
exports.create = async (req, res) => {
  try {
    //let id = req.user.id;

    //console.log(req.user.id);
    let {
      businessRegistrationName,
      businessRegistrationNumber,
      businessDisplayName,
      userId,
      typeOfBusiness,
      description,
      region,
      town,
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
    let id = userId
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

    const checkExistingUser = await User.findOne({ where: { id } });
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
      userId: id,
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
        attibutes: ["industryIcon"],
        where:{
          industryName:primaryIndustry
        },
        
      });
      console.log(businessIcon)
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
      attibutes: ["id"],
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
      notification: "New user has added their business on the system. Please review their bsuiness",
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
      userId: id,
      notification:
        "Your form has been submitted successfully. Admin will review your application and approve or decline your form. Your will be sent a another notification with the status of your application. Onces your application is approved it will be added to the list of your businesses on the msme profile and your business will be visible to all user, remember you can always turn off visibility in your profile settings if you dont want people to see your business",
      type: "Alert",
      priority: "High",
      createdAt: Date.now(),
      senderId:id,
      viewed: false,
    });
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
exports.like = async (req, res) => {
  try {
    let userId = req.user.id;

    if (!userId) {
      return res.status(404).json({
        status: "FAILURE",
        message: "Empty parameters.",
      });
    }
    const existingUser = await User.findOne({
      where: {
        id: userId,
      },
    });
    if (!existingUser) {
      return res.status(409).json({
        status: "FAILURE",
        message: "userId provided does not exist!",
      });
    }
    const alreadyLike = await Favourite.findOne({
      where: {
        userId,
      },
    });
    if (alreadyLike) {
      return res.status(404).json({
        status: "FAILURE",
        message: "Business already added to favourite!",
      });
    }
    await Favourite.create({
      userId,
      businessId,
    });
    res.status(200).json({
      status: "SUCCESS",
      message: "Business successfully added to favourite!",
    });
  } catch (error) {
    res.status(500).json({
      status: "FAILURE",
      message: "Internal server error: " + error.message,
    });
  }
};
exports.unlike = async (req, res) => {
  try {
    let userId = req.user.id;
    let { businessId } = req.params;

    if (!userId || !businessId) {
      return res.status(404).json({
        status: "FAILURE",
        message: "Empty parameters.",
      });
    }
    const existingUser = await User.findOne({
      where: {
        id: userId,
      },
    });
    if (!existingUser) {
      return res.status(409).json({
        status: "FAILURE",
        message: "userId provided does not exist!",
      });
    }
    const existingBusiness = await MsmeInformation.findOne({
      where: {
        id: businessId,
      },
    });
    if (!existingBusiness) {
      return res.status(409).json({
        status: "FAILURE",
        message: "UserId and businessId provided does not exist!",
      });
    }
    const alreadyLike = await Favourite.findOne({
      where: {
        userId,
        businessId,
      },
    });
    if (!alreadyLike) {
      return res.status(404).json({
        status: "FAILURE",
        message: "Business not added to favourite!",
      });
    }
    await Favourite.destroy({
      where: {
        userId,
        businessId,
      },
    });
    res.status(200).json({
      status: "SUCCESS",
      message: "Business successfully removed from favourite!",
    });
  } catch (error) {
    res.status(500).json({
      status: "FAILURE",
      message: "Internal server error: " + error.message,
    });
  }
};

exports.all = async (req, res) => {
  try {
    const allMsmeInformations = await MsmeInformation.findAll({
      where: {
        status: "Approved",
        isVisibility: true
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
        {
          model: BusinessHour,
          as: "businessHours",
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
exports.filterByIndustry = async (req, res) => {
  try {
    const { industryName } = req.body;
    if (!industryName) {
      return res
        .status(400)
        .json({ error: "Industry name parameter is required" });
    }
    const checkPrimaryExist = await PrimaryIndustry.findOne({
      where: {
        industryName,
      },
    });
    const checkSecondaryExist = await SecondaryIndustry.findOne({
      where: {
        industryName,
      },
    });

    if (!checkPrimaryExist && !checkSecondaryExist) {
      return res
        .status(400)
        .json({ error: "Industry name provided does not exist!" });
    }
    const allMsmeInformations = await MsmeInformation.findAll({
      where: {
        status: "Approved",
        isVisibility: true,
        [Op.or]: [
          {
            primaryIndustry: industryName,
          },
          {
            secondaryIndustry: industryName,
          },
        ],
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
        {
          model: BusinessHour,
          as: "businessHours",
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
exports.recentlyAdded = async (req, res) => {
  try {
    const allMsmeInformations = await MsmeInformation.findAll({
      where: {
        status: "Approved",
        isVisibility:true
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
        {
          model: BusinessHour,
          as: "businessHours",
        },
      ],
      order:[['createdAt','DESC']],
      limit: 7
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

exports.allRegionBusiness = async (req, res) => {
  try {
    let { region } = req.params;
    if (!region) {
      return res.status(400).json({
        status: "FAILURE",
        message: "Empty parameter: region.",
      });
    }
    const isRegion = await Region.findOne({
      where: {
        regionName: region,
      },
    });
    if (!isRegion) {
      return res.status(404).json({
        status: "FAILURE",
        message: "The provided region does not exist.",
      });
    }
    const allMsmeInformations = await MsmeInformation.findAll({
      where: {
        region,
        status: "Approved",
        isVisibility:true
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
        {
          model: BusinessHour,
          as: "businessHours",
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

exports.allTownBusiness = async (req, res) => {
  try {
    let { townName } = req.body;
    if (!townName) {
      return res.status(400).json({
        status: "FAILURE",
        message: "Empty parameter: region.",
      });
    }
    const isTown = await Town.findOne({
      where: {
        townName,
      },
    });
    if (!isTown) {
      return res.status(404).json({
        status: "FAILURE",
        message: "The provided town does not exist.",
      });
    }
    const allMsmeInformations = await MsmeInformation.findAll({
      where: {
        town:townName,
        status: "Approved",
        isVisibility:true
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
        {
          model: BusinessHour,
          as: "businessHours",
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
exports.allLiked = async (req, res) => {
  try {
    let { userId } = req.user.id;

    if (!userId) {
      return res.status(400).json({
        status: "FAILURE",
        message: "Empty parameter: userId.",
      });
    }

    const existingUser = await User.findOne({
      where: {
        id: userId,
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        status: "FAILURE",
        message: "User does not exist.",
      });
    }

    const likedBusinesses = await Favourite.findAll({
      where: {
        userId,
        isVisibility:true
      },
      attributes: ["businessId"],
    });

    const businessIds = likedBusinesses.map((like) => like.businessId);

    if (businessIds.length === 0) {
      return res.status(404).json({
        status: "FAILURE",
        message: "The user has not liked any businesses.",
      });
    }

    const businesses = await MsmeInformation.findAll({
      where: {
        id: businessIds,
        status: "Approved",
      },
    });

    if (businesses.length === 0) {
      return res.status(404).json({
        status: "FAILURE",
        message:
          "No businesses found in MsmeInformation table for the liked business IDs.",
      });
    }

    res.status(200).json({
      status: "SUCCESS",
      message: "All MSME information retrieved successfully!",
      data: businesses,
    });
  } catch (error) {
    res.status(500).json({
      status: "FAILURE",
      message: "Internal server error: " + error.message,
    });
  }
};

exports.allSingleUserMsme = async (req, res) => {
  try {
    const id = req.user.id;

    if (!id) {
      return res.status(400).json({
        status: "FAILURE",
        message: "Empty parameter",
      });
    }

    const msmeInformation = await MsmeInformation.findAll({
      where: {
        userId: id,
        status: "Approved",
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
        {
          model: BusinessHour,
          as: "businessHours",
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
exports.single = async (req, res) => {
  try {
    const { businessId } = req.params;

    if (!businessId) {
      return res.status(400).json({
        status: "FAILURE",
        message: "Empty parameter",
      });
    }

    const msmeInformation = await MsmeInformation.findOne({
      where: {
        id: businessId,
        status: "Approved",
        isVisibility:true
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
        {
          model: BusinessHour,
          as: "businessHours",
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

exports.update = async (req, res) => {
  try {
    let { businessId } = req.params;
    const userId = req.user.id;

    let {
      businessRegistrationName,
      businessDisplayName,
      businessRegistrationNumber,
      typeOfBusiness,
      description,
      region,
      town,
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
    } = req.body;

    if (!businessId || !userId) {
      return res.status(400).json({
        status: "FAILURE",
        message: "Empty parameter",
      });
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

    const checkExistingUser = await User.findOne({
      where: {
        id: userId,
      },
    });

    if (!checkExistingUser) {
      return res.status(404).json({
        status: "FAILURE",
        message:
          "User trying to access this resource does not exist on the system.",
      });
    }
    const checkExistingBusiness = await MsmeInformation({
      where: {
        id: businessId,
      },
    });

    if (!checkExistingBusiness) {
      return res.status(404).json({
        status: "FAILURE",
        message: "The business with the provided id does not exist",
      });
    }

    if (
      businessRegistrationName !==
      checkExistingBusiness.businessRegistrationName
    ) {
      const existBusiness = await MsmeInformation.findOne({
        while: {
          businessRegistrationName,
        },
      });
      if (existBusiness) {
        return res.status(409).json({
          status: "FAILURE",
          message: "Business name already exists.",
        });
      }
    }
    await MsmeInformation.update(
      {
        businessRegistrationName,
        businessDisplayName,
        businessRegistrationNumber,
        businessAddress,
        typeOfBusiness,
        description,
        region,
        town,
        primaryIndustry,
        secondaryIndustry,
        yearOfEstablishment,
        annualTurnover,
      },
      {
        where: {
          id: businessId,
        },
      }
    );
    await MsmeFounderInfo.update(
      { founderName, founderAge, founderGender },
      {
        where: {
          businessId,
        },
      }
    );
    await MsmeContactInfo.update(
      {
        businessAddress,
        phoneNumber,
        whatsAppNumber,
        email,
        website,
        twitter,
        facebook,
        instagram,
        linkedIn,
      },
      {
        where: {
          businessId,
        },
      }
    );
    await MsmeAdditionalInfo.update(
      { numberOfEmployees },
      {
        where: {
          businessId,
        },
      }
    );
    res.status(200).json({
      status: "SUCCESS",
      message: "Business info successfully updated!",
    });
  } catch (error) {
    res.status(500).json({
      status: "FAILURE",
      message: "Internal server error: " + error.message,
    });
  }
};

exports.updateLogo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { businessId } = req.params;
    const { businessLogo } = req.body;
    if (!businessId || !userId) {
      return res.status(400).json({
        status: "FAILURE",
        message: "Empty parameter",
      });
    }
    const checkExistingUser = await User.findOne({
      where: {
        id: userId,
      },
    });

    if (!checkExistingUser) {
      return res.status(404).json({
        status: "FAILURE",
        message:
          "User trying to access this resource does not exist on the system.",
      });
    }
    const existing = await MsmeAdditionalInfo.findOne({
      where: {
        businessId,
      },
    });
    if (!existing) {
      return res.status(404).json({
        status: "FAILURE",
        message: "The business resource does not exist on the system.",
      });
    }
    await MsmeAdditionalInfo.update(
      { businessLogo },
      {
        where: {
          businessId,
        },
      }
    );
    res.status(200).json({
      status: "SUCCESS",
      message: "Business logo successfully updated",
    });
  } catch (error) {
    res.status(500).json({
      status: "FAILURE",
      message: "Internal server error: " + error.message,
    });
  }
};
exports.updateImage1 = async (req, res) => {
  try {
    const userId = req.user.id;
    const { businessId } = req.params;
    const { image1 } = req.body;
    if (!businessId || !userId) {
      return res.status(400).json({
        status: "FAILURE",
        message: "Empty parameter",
      });
    }
    const checkExistingUser = await User.findOne({
      where: {
        id: userId,
      },
    });

    if (!checkExistingUser) {
      return res.status(404).json({
        status: "FAILURE",
        message:
          "User trying to access this resource does not exist on the system.",
      });
    }
    const existing = await MsmeAdditionalInfo.findOne({
      where: {
        businessId,
      },
    });
    if (!existing) {
      return res.status(404).json({
        status: "FAILURE",
        message: "The business resource does not exist on the system.",
      });
    }
    await MsmeAdditionalInfo.update(
      { image1 },
      {
        where: {
          businessId,
        },
      }
    );
    res.status(200).json({
      status: "SUCCESS",
      message: "Image 1 picture updated",
    });
  } catch (error) {
    res.status(500).json({
      status: "FAILURE",
      message: "Internal server error: " + error.message,
    });
  }
};
exports.updateImage2 = async (req, res) => {
  try {
    const userId = req.user.id;
    const { businessId } = req.params;
    const { image2 } = req.body;
    if (!businessId || !userId) {
      return res.status(400).json({
        status: "FAILURE",
        message: "Empty parameter",
      });
    }
    const checkExistingUser = await User.findOne({
      where: {
        id: userId,
      },
    });

    if (!checkExistingUser) {
      return res.status(404).json({
        status: "FAILURE",
        message:
          "User trying to access this resource does not exist on the system.",
      });
    }
    const existing = await MsmeAdditionalInfo.findOne({
      where: {
        businessId,
      },
    });
    if (!existing) {
      return res.status(404).json({
        status: "FAILURE",
        message: "The business resource does not exist on the system.",
      });
    }
    await MsmeAdditionalInfo.update(
      { image2 },
      {
        where: {
          businessId,
        },
      }
    );
    res.status(200).json({
      status: "SUCCESS",
      message: "Image 2 picture updated",
    });
  } catch (error) {
    res.status(500).json({
      status: "FAILURE",
      message: "Internal server error: " + error.message,
    });
  }
};
exports.updateImage3 = async (req, res) => {
  try {
    const userId = req.user.id;
    const { businessId } = req.params;
    const { image3 } = req.body;
    if (!businessId || !userId) {
      return res.status(400).json({
        status: "FAILURE",
        message: "Empty parameter",
      });
    }
    const checkExistingUser = await User.findOne({
      where: {
        id: userId,
      },
    });

    if (!checkExistingUser) {
      return res.status(404).json({
        status: "FAILURE",
        message:
          "User trying to access this resource does not exist on the system.",
      });
    }
    const existing = await MsmeAdditionalInfo.findOne({
      where: {
        businessId,
      },
    });
    if (!existing) {
      return res.status(404).json({
        status: "FAILURE",
        message: "The business resource does not exist on the system.",
      });
    }
    await MsmeAdditionalInfo.update(
      { image3 },
      {
        where: {
          businessId,
        },
      }
    );
    res.status(200).json({
      status: "SUCCESS",
      message: "Image 3 picture updated",
    });
  } catch (error) {
    res.status(500).json({
      status: "FAILURE",
      message: "Internal server error: " + error.message,
    });
  }
};
exports.businessHours = async (req, res) => {
  try {
    const userId = req.user.id;
    const { businessId } = req.params;
    const {
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      sunday,
      alwaysOpen,
    } = req.body;
    if (!businessId || !userId) {
      return res.status(400).json({
        status: "FAILURE",
        message: "Empty parameter",
      });
    }
    const checkExistingUser = await User.findOne({
      where: {
        id: userId,
      },
    });

    if (!checkExistingUser) {
      return res.status(404).json({
        status: "FAILURE",
        message:
          "User trying to access this resource does not exist on the system.",
      });
    }
    const existing = await MsmeAdditionalInfo.findOne({
      where: {
        businessId,
      },
    });
    if (!existing) {
      return res.status(404).json({
        status: "FAILURE",
        message: "The business resource does not exist on the system.",
      });
    }

    if (alwaysOpen) {
      monday = "Open 24 hours";
      tuesday = "Open 24 hours";
      wednesday = "Open 24 hours";
      thursday = "Open 24 hours";
      friday = "Open 24 hours";
      saturday = "Open 24 hours";
      sunday = "Open 24 hours";
      await BusinessHour.update(
        {
          monday,
          tuesday,
          wednesday,
          thursday,
          friday,
          saturday,
          sunday,
        },
        {
          where: {
            businessId,
          },
        }
      );
    } else {
      await BusinessHour.update(
        {
          monday,
          tuesday,
          wednesday,
          thursday,
          friday,
          saturday,
          sunday,
        },
        {
          where: {
            businessId,
          },
        }
      );
    }
    res.status(200).json({
      status: "SUCCESS",
      message: "Image 3 picture updated",
    });
  } catch (error) {
    res.status(500).json({
      status: "FAILURE",
      message: "Internal server error: " + error.message,
    });
  }
};
exports.delete = async (req, res) => {
  try {
    const id = req.user.id;
    const { businessId } = req.params;
    if (!businessId || !id) {
      return res.status(400).json({
        status: "FAILURE",
        message: "Empty parameter",
      });
    }
    const checkExistingUser = await User.findOne({
      where: {
        id
      },
    });

    if (!checkExistingUser) {
      return res.status(404).json({
        status: "FAILURE",
        message:
          "User trying to access this resource does not exist on the system.",
      });
    }
    const checkBusiness = await MsmeInformation.findOne({
      where: {
        id,
      },
    });

    if (!checkBusiness) {
      return res.status(404).json({
        status: "FAILURE",
        message: "The business does not exist on the system.",
      });
    }
    await MsmeInformation.destroy({
      where: {
        id: businessId,
      },
    });
    await MsmeFounderInfo.destroy({
      where: {
        businessId,
      },
    });
    await MsmeContactInfo.destroy({
      where: {
        businessId,
      },
    });
    await MsmeAdditionalInfo.destroy({
      where: {
        businessId,
      },
    });
    await BusinessHour.destroy({
      where: {
        businessId,
      },
    });
    res.status(200).json({
      status: "SUCCESS",
      message: "Business successfully deleted!",
    });
  } catch (error) {
    res.status(500).json({
      status: "FAILURE",
      message: "Internal server error: " + error.message,
    });
  }
};
exports.visibility = async (req, res) => {
  try {
    const id = req.user.id;
    const { businessId, visibility } = req.body;

    if (!businessId || !id) {
      return res.status(400).json({
        status: "FAILURE",
        message: "Empty parameter",
      });
    }
    const checkExistingUser = await User.findOne({
      where: {
        id,
      },
    });

    if (!checkExistingUser) {
      return res.status(404).json({
        status: "FAILURE",
        message:
          "User trying to access this resource does not exist on the system.",
      });
    }
    const checkBusiness = await MsmeInformation.findOne({
      where: {
        id: businessId,
      },
    });
    if (!checkBusiness) {
      return res.status(404).json({
        status: "FAILURE",
        message: "Business does not exist on the system.",
      });
    }
    await MsmeInformation.update(
      {
        isVisibility: visibility,
      },
      {
        where: {
          id: businessId,
        },
      }
    );
    res.status(200).json({
      status: "SUCCESS",
      message: "Visibility successfully updated!",
    });
  } catch (error) {
    res.status(500).json({
      status: "FAILURE",
      message: "Internal server error: " + error.message,
    });
  }
};
