const { where, Op, Sequelize } = require("sequelize");
const Message = require("../../models/directMessage");
const User = require("../../models/user");
const CapitalizeFirstLetter = require("../../utils/shared/capitalizeFirstLetter");

exports.create = async (req, res) => {
  try {
    let id = require.user.id;
    let { recieverId, message,businessId } = req.body;

    if (!id || !recieverId || !message || !businessId) {
      return res.status(400).json({
        status: "FAILURE",
        message: "Empty input fields",
      });
    }
    if (recieverId === senderId) {
      return res.status(400).json({
        status: "FAILURE",
        message: "Sending messages to yourself is not allowed!",
      });
    }
    message = CapitalizeFirstLetter(message);

    const checksender = await User.findOne({
      where: {
        id,
      },
    });

    if (!checksender) {
      return res.status(400).json({
        status: "FAILURE",
        message: "User does not exist",
      });
    }

    const checkReciever = await User.findOne({
      where: {
        id: recieverId,
      },
    });

    if (!checkReciever) {
      return res.status(400).json({
        status: "FAILURE",
        message: "User does not exist",
      });
    }
    const checkBusiness = await MsmeInformation.findOne({
      where:{
        id: businessId
      }
    });
    if (!checkBusiness) {
      return res.status(400).json({
        status: "FAILURE",
        message: "Business does not exist",
      });
    }
    const newMessage = await Message.create({
      recieverId,
      senderId: id,
      message,
      viewed: false,
      businessId,
      createdAt: Date.now(),
    });

    if (newMessage) {
      return res.status(201).json({
        status: "SUCCESS",
        message: "Message successfully sent!",
      });
    } else {
      return res.status(500).json({
        status: "FAILURE",
        message:
          "Internal server error. Something went wrong during the insertion of data into the database",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "FAILURE",
      message: "Internal server error: " + error.message,
    });
  }
};

const sequelize = require("../../config/dbConfig"); // Adjust the path to your Sequelize instance
const MsmeInformation = require("../../models/msmeInformation");

exports.all = async (req, res) => {
  try {
    let id = req.user.id;
    if (!id) {
      return res.status(400).json({
        status: "FAILURE",
        message: "Empty input fields",
      });
    }
    const results = await sequelize.query(
      `
      SELECT DISTINCT
        CASE
          WHEN senderId = :id THEN recieverId
          ELSE senderId
        END AS userId
      FROM messages
      WHERE senderId = :id OR recieverId = :id
    `,
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!Array.isArray(results)) {
      throw new Error("Unexpected results format from query");
    }

    const userIds = results
      .map((row) => row.userId)
      .filter((userId) => userId !== id);

    const conversations = await Promise.all(
      userIds.map(async (otherUserId) => {
        const latestMessage = await Message.findOne({
          where: {
            [Op.or]: [
              { [Op.and]: [{ senderId: id }, { recieverId: otherUserId }] },
              { [Op.and]: [{ senderId: otherUserId }, { recieverId: id }] },
            ],
          },
          order: [["createdAt", "DESC"]],
        });

        const unreadCount = await Message.count({
          where: {
            recieverId: id,
            senderId: otherUserId,
            viewed: false,
          },
        });

        const otherUser = await User.findOne({
          where: { id: otherUserId },
          attributes: ["id", "profileImage","firstName", "lastName"],
        });

        return {
          userId: otherUser.id,
          firstName: otherUser.firstName,
          lastName: otherUser.lastName,
          profilePicture: otherUser.profileImage,
          latestMessage,
          unreadCount,
        };
      })
    );

    res.status(200).json({
      status: "SUCCESS",
      message: "Conversations successfully retrieved!",
      data: conversations,
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
    const { id, senderId } = req.body;

    if (!senderId || !id) {
      return res.status(400).json({
        status: "FAILURE",
        message: "Empty parameter",
      });
    }

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          {
            senderId,
            recieverId: id,
          },
          {
            senderId: id,
            recieverId: senderId,
          },
        ],
      },
      order: [["createdAt", "DESC"]],
    });

    const sentMessages = messages.filter((msg) => msg.senderId === senderId);
    const receivedMessages = messages.filter((msg) => msg.senderId === id);

    const conversation = {
      sent: sentMessages,
      received: receivedMessages,
    };

    res.status(200).json({
      status: "SUCCESS",
      message: "Messages successfully retrieved!",
      data: conversation,
    });
  } catch (error) {
    res.status(500).json({
      status: "FAILURE",
      message: "Internal server error: " + error.message,
    });
  }
};
exports.count = async (req, res) => {
  try {
    let id = req.user.id;

    if (!id) {
      return res.status(404).json({
        status: "FAILURE",
        message: "Reciever ID is required.",
      });
    }
    const totalCount = await Message.count({
      where: {
        recieverId: id,
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
exports.update = async (req, res) => {
  try {
    let id = req.user.id;
    let { recieverId, message, messageId } = req.body;

    if (!recieverId || !message || !messageId) {
      return res.status(400).json({
        status: "FAILURE",
        message: "Empty input fields",
      });
    }

    message = CapitalizeFirstLetter(message);

    const checksender = await User.findOne({
      where: {
        id,
      },
    });

    if (!checksender) {
      return res.status(400).json({
        status: "FAILURE",
        message: "Sender does not exist",
      });
    }

    const checkReciever = await User.findOne({
      where: {
        id: recieverId,
      },
    });

    if (!checkReciever) {
      return res.status(400).json({
        status: "FAILURE",
        message: "Receiver does not exist",
      });
    }

    const [updated] = await Message.update(
      { message, viewed: false },
      {
        where: {
          id: messageId,
          recieverId,
          senderId: id,
        },
      }
    );

    if (updated) {
      return res.status(200).json({
        status: "SUCCESS",
        message: "Message successfully updated!",
      });
    } else {
      return res.status(500).json({
        status: "FAILURE",
        message: "Failed to update Message.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "FAILURE",
      message: "Internal server error: " + error.message,
    });
  }
};
exports.viewed = async (req, res) => {
  try {
    const recieverId = req.user.id;
    const { senderId } = req.body;

    if (!recieverId || !senderId) {
      return res.status(400).json({
        status: "FAILURE",
        message: "Empty parameters.",
      });
    }

    const checkUser = await User.findOne({
      where: { id: recieverId },
    });
    if (!checkUser) {
      return res.status(404).json({
        status: "FAILURE",
        message: "User does not exist!",
      });
    }

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId, recieverId },
          { senderId: recieverId, recieverId: senderId },
        ],
        viewed: false,
      },
    });

    if (messages.length === 0) {
      return res.status(404).json({
        status: "FAILURE",
        message: "No messages found for this conversation!",
      });
    }

    await Message.update(
      { viewed: true },
      {
        where: {
          [Op.or]: [
            { senderId, recieverId },
            { senderId: recieverId, recieverId: senderId },
          ],
        },
      }
    );

    res.status(200).json({
      status: "SUCCESS",
      message: "Message statuses successfully updated!",
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
    let id = req.user.id;
    let { messageId } = req.body;

    if (id === "" || messageId == "") {
      res.status(400).json({
        status: "FAILURE",
        message: "Empty parameter",
      });
    } else {
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
      const checkMessage = await Message.findOne({
        where: {
          id: messageId,
        },
      });
      if (checkMessage) {
        await Message.destroy({
          where: {
            id: messageId,
          },
        });
        res.status(200).json({
          status: "SUCCESS",
          message: "Message successfully deleted!",
        });
      } else {
        res.status(404).json({
          status: "FAILURE",
          message: "Message with the provided id does not exist.",
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      status: "FAILURE",
      message: "Internal server error: " + error.message,
    });
  }
};
