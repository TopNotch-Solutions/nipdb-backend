const { where } = require("sequelize");
const Notification = require("../../models/notification");
const Admin = require("../../models/admin");
const CapitalizeFirstLetter = require("../../utils/shared/capitalizeFirstLetter");
const NotificationHistory = require("../../models/notificationHistory");
const User = require("../../models/user");
const AdminNotification = require("../../models/adminNotifications");

exports.createAll = async (req, res) => {
    try{
        let { notification, senderId, type, priority } = req.body;
        if (!notification || !senderId || !type || !priority) {
            return res.status(400).json({
              status: "FAILURE",
              message: "Empty parameter",
            });
          }
          notification = CapitalizeFirstLetter(notification);
          type = CapitalizeFirstLetter(type);
          priority = CapitalizeFirstLetter(priority);

          const users = await User.findAll({
            attibutes:['id']
          });
          if (!users) {
            return res.status(404).json({
              status: "FAILURE",
              message:
                "There are no users.",
            });
          }
          const admin = await Admin.findOne({
            where:{
                id: senderId
            }
          });
          if (!admin) {
            return res.status(404).json({
              status: "FAILURE",
              message:
                "The senderId does not exist.",
            });
          }
          const userIds = users.map(user => user.id);
          
          const notifications = userIds.map(userId => ({
            userId,
            notification,
            senderId,
            type,
            priority,
            createdAt: Date.now(),
            viewed:false
          }));
          if (!notifications) {
            return res.status(404).json({
              status: "FAILURE",
              message:
                "An error occured during mapping of data.",
            });
          }
          await NotificationHistory.create({
            notification,
            createdAt: Date.now(),
            senderId,
            type,
            priority
          });
          await Notification.bulkCreate(notifications);

    res.status(200).json({ status: 'SUCCESS', message: 'Notifications sent to all users successfully.' });
    }catch (error) {
        res.status(500).json({
          status: "FAILURE",
          message: "Internal server error: " + error.message,
        });
      }
}
exports.createSingle = async (req, res) => {
    try{
        let { notification, senderId, userId, type, priority } = req.body;
        if (!notification || !senderId || !type || !priority) {
            return res.status(400).json({
              status: "FAILURE",
              message: "Empty parameter",
            });
          }
          notification = CapitalizeFirstLetter(notification);
          type = CapitalizeFirstLetter(type);
          priority = CapitalizeFirstLetter(priority);

          const user = await Admin.findOne({
            where:{
                id: userId
            }
          });
          if (!user) {
            return res.status(404).json({
              status: "FAILURE",
              message:
                "The user with the provided userId does not exist.",
            });
          }
          const newNotification = await Notification.create({
            userId,
            notification,
            senderId,
            type,
            priority,
            createdAt: Date.now(),
            viewed: false
          });

          if (!newNotification) {
            return res.status(404).json({
              status: "FAILURE",
              message:
                "The user with the provided userId does not exist.",
            });
          }
          await NotificationHistory.create({
            notification,
            createdAt: Date.now(),
            senderId,
            type,
            priority
          });
    res.status(200).json({ status: 'SUCCESS', message: 'Notifications successfully sent to user.' });
    }catch (error) {
        res.status(500).json({
          status: "FAILURE",
          message: "Internal server error: " + error.message,
        });
      }
}
exports.allAdminNotfication = async (req, res) => {
    try {
        const allUserNotfication = await NotificationHistory.findAll({});
        if (!allUserNotfication) {
            return res.status(404).json({
              status: "FAILURE",
              message:
                "There are no notifications for the provided user.",
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
}
exports.singleAdminNotfication = async (req, res) => {
    try {
        let {userId} = req.params;

        if (!userId) {
            return res.status(404).json({
              status: "FAILURE",
              message:
                "UserId is required.",
            });
          }
        const allUserNotfication = await AdminNotification.findAll({
          where:{
            userId
          }
        });
        if (!allUserNotfication) {
            return res.status(404).json({
              status: "FAILURE",
              message:
                "There are no notifications for the provided user.",
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
}
exports.totalCount = async (req, res) => {
    try{
        let {userId} = req.params;

        if (!userId) {
            return res.status(404).json({
              status: "FAILURE",
              message:
                "UserId is required.",
            });
          }
        const totalCount = await AdminNotification.count({
            where:{
                userId,
                viewed: false
            }
        });
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
}
exports.updateViewed = async (req, res) => {
    try{
        let {userId, id} = req.params;

        if (!userId || !id) {
            return res.status(404).json({
              status: "FAILURE",
              message:
                "Empty parameters.",
            });
          }
        const checkUser =await Admin.findOne({
            where:{
                id:userId
            }
        });
        if(!checkUser){
            return res.status(200).json({
                status: "FAILURE",
                message: "User does not exist!",
              });
        }
        const findNotification =await AdminNotification.findOne({
            where:{
                userId,
                id
            }
        });
        if(!findNotification){
            return res.status(200).json({
                status: "FAILURE",
                message: "Notification does not exist!",
              });
        }
        await AdminNotification.update(
            {viewed: true},
            {
                where:{
                    userId,
                    id
                }
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
}
exports.deleteSingle = async (req, res) => {
    try{
        let {userId, id} = req.params;

        if (!userId || !id) {
            return res.status(404).json({
              status: "FAILURE",
              message:
                "Empty parameters.",
            });
          }
        const checkUser =await Admin.findOne({
            where:{
                id:userId
            }
        });
        if(!checkUser){
            return res.status(200).json({
                status: "FAILURE",
                message: "User does not exist!",
              });
        }
        const findNotification =await AdminNotification.findOne({
            where:{
                userId,
                id
            }
        });
        if(!findNotification){
            return res.status(200).json({
                status: "FAILURE",
                message: "Notification does not exist!",
              });
        }
        await AdminNotification.destroy(
            {
                where:{
                    userId,
                    id
                }
            }
        );
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
}
// exports.updatebulk = async (req, res) => {}
// exports.updateSingle = async (req, res) => {}
// exports.deletebulk = async (req, res) => {}
// exports.deleteSingle = async (req, res) => {}
