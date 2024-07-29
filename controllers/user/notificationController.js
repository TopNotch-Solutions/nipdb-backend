const { where } = require("sequelize");
const Notification = require("../../models/notification");
const User = require("../../models/user");

exports.allUserNotfication = async (req, res) => {
  try {
    let { userId } = req.user.id;

    if (!userId) {
      return res.status(404).json({
        status: "FAILURE",
        message: "UserId is required.",
      });
    }
    const allUserNotfication = await Notification.findAll({
      where: {
        userId,
      },
    });
    if (!allUserNotfication) {
      return res.status(404).json({
        status: "FAILURE",
        message: "There are no notifications for the provided user.",
      });
    }
    res.status(200).json({
      status: "SUCCESS",
      message: "All user notifications retrieved successfully!",
      data: allUserNotfication,
    });
  } catch (error) {
    res.status(500).json({
      status: "FAILURE",
      message: "Internal server error: " + error.message,
    });
  }
};
exports.totalNotficationCount = async (req, res) => {
  try {
    let { userId } = req.user.id;

    if (!userId) {
      return res.status(404).json({
        status: "FAILURE",
        message: "UserId is required.",
      });
    }
    const totalCount = await Notification.count({
      where: {
        userId,
        viewed: false,
      },
    });
    if (!totalCount) {
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
exports.updateViewed = async (req, res) => {
  try {
    //let userId = req.user.id;
    let { id } = req.body;

    if (!id) {
      return res.status(404).json({
        status: "FAILURE",
        message: "Empty parameters.",
      });
    }
    const checkUser = await User.findOne({
      where: {
        id,
      },
    });
    if (!checkUser) {
      return res.status(200).json({
        status: "FAILURE",
        message: "User does not exist!",
      });
    }
    await Notification.update(
      { viewed: true },
      {
        where: {
          userId:id,
        },
      }
    );
    res.status(200).json({
      status: "SUCCESS",
      message: "Notification successfully updated!",
    });
  } catch (error) {
    res.status(500).json({
      status: "FAILURE",
      message: "Internal server error: " + error.message,
    });
  }
};
exports.deleteSingle = async (req, res) => {
  try {
    let userId = req.user.id;
    let { id } = req.params;

    if (!userId || !id) {
      return res.status(404).json({
        status: "FAILURE",
        message: "Empty parameters.",
      });
    }
    const checkUser = await User.findOne({
      where: {
        id: userId,
      },
    });
    if (!checkUser) {
      return res.status(200).json({
        status: "FAILURE",
        message: "User does not exist!",
      });
    }
    const findNotification = await Notification.findOne({
      where: {
        userId,
        id,
      },
    });
    if (!findNotification) {
      return res.status(200).json({
        status: "FAILURE",
        message: "Notification does not exist!",
      });
    }
    await Notification.destroy({
      where: {
        userId,
        id,
      },
    });
    res.status(200).json({
      status: "SUCCESS",
      message: "Notification successfully deleted!",
    });
  } catch (error) {
    res.status(500).json({
      status: "FAILURE",
      message: "Internal server error: " + error.message,
    });
  }
};
