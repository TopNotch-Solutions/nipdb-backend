const express = require("express");
const bodyParser = require("body-parser");
const sequelize = require("./config/dbConfig");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const User = require("./models/user");
const Notification = require("./models/notification");
const Message = require("./models/directMessage");
const AdminNotification = require("./models/adminNotifications");
require("dotenv").config();

const authAdminRouter = require("./routes/adminRoutes/authRoute");
const authUserRouter = require("./routes/userRoutes/authRoute");
const bsoAdminRouter = require("./routes/adminRoutes/bsoRoute");
const bsoUserRouter = require("./routes/userRoutes/bsoRoutes");
const regionAdminRouter = require("./routes/adminRoutes/regionRoute");
const regionUserRouter = require("./routes/userRoutes/regionRoute");
const townAdminRouter = require("./routes/adminRoutes/townRoute");
const townUserRouter = require("./routes/userRoutes/townRoute");
const primaryIndustryAdminRouter = require("./routes/adminRoutes/primaryIndustryRoute");
const primaryIndustryUserRouter = require("./routes/userRoutes/primaryIndustryRoute");
const secondaryIndustryAdminRouter = require("./routes/adminRoutes/secondaryIndustryRoute");
const secondaryIndustryUserRouter = require("./routes/userRoutes/secondaryIndustryRoute");
const msmeAdminRouter = require("./routes/adminRoutes/msmeRoute");
const msmeUserRouter = require("./routes/userRoutes/msmeRoute");
const notificationAdminRouter = require("./routes/adminRoutes/notificationRoute");
const notificationUserRouter = require("./routes/userRoutes/notificationRoute");
const mobileImageAdminRouter = require("./routes/adminRoutes/mobileImageRoute");
const mobileImageUserRouter = require("./routes/userRoutes/mobileImageRoute");
const opportunityAdminRouter = require("./routes/adminRoutes/opportunityRoute");
const opportunityUserRouter = require("./routes/userRoutes/opportunityRoute");
const directMessageUserRouter = require("./routes/userRoutes/directMessageRoute");
const userAdminRouter = require("./routes/adminRoutes/userRoute");
const Admin = require("./models/admin");
const NotificationHistory = require("./models/notificationHistory");
const { where } = require("sequelize");
const CapitalizeFirstLetter = require("./utils/shared/capitalizeFirstLetter");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST","PUT","DELETE"],
  },
});

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST","PUT","DELETE","PATCH"],
    credentials: true,
  })
);

app.use("/auth/admin", authAdminRouter);
app.use("/auth/user", authUserRouter);
app.use("/bso/admin", bsoAdminRouter);
app.use("/bso/user", bsoUserRouter);
app.use("/region/admin", regionAdminRouter);
app.use("/region/user", regionUserRouter);
app.use("/town/admin", townAdminRouter);
app.use("/town/user", townUserRouter);
app.use("/primaryIndustry/admin", primaryIndustryAdminRouter);
app.use("/primaryIndustry/user", primaryIndustryUserRouter);
app.use("/secondaryIndustry/admin", secondaryIndustryAdminRouter);
app.use("/secondaryIndustry/user", secondaryIndustryUserRouter);
app.use("/msme/admin", msmeAdminRouter);
app.use("/msme/user", msmeUserRouter);
app.use("/notifications/admin", notificationAdminRouter);
app.use("/notifications/user", notificationUserRouter);
app.use("/admin/mobile-images", mobileImageAdminRouter);
app.use("/user/mobile-images", mobileImageUserRouter);
app.use("/opportunities/admin", opportunityAdminRouter);
app.use("/opportunities/user", opportunityUserRouter);
app.use("/directMessaging", directMessageUserRouter);
app.use("/system", userAdminRouter);
app.use("/*", (req, res) => {
  res.status(404).json({
    status: "FAILURE",
    message: "Route not found",
  });
});

let onlineUsers = [];

const addNewUser = (id, role, socketId) => {
  console.log(id, role, socketId);
  if (!onlineUsers.some((user) => user.id === id && user.role === role)) {
    onlineUsers.push({ id, role, socketId });
  }
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (id, role) => {
  return onlineUsers.find((user) => user.id === id && user.role === role);
};

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  socket.on("addNewUser", (id, role) => {
    addNewUser(id, role, socket.id);
    console.log(onlineUsers);
  });

  socket.on(
    "sendToSingleNotificationAdmin",
    async ({ userId, notification, type, priority, senderId }) => {
      let role = "User";
      const receiver = getUser(userId, role);
      const newCapitalizedNotification = CapitalizeFirstLetter(notification);
      if (userId && notification && type && priority) {
        const checkNewAdminExist = await Admin.findOne({
          where: {
            id: senderId,
          },
        });
        const checkNewUserExist = await User.findOne({
          where: {
            id: userId,
          },
        });

        if (checkNewAdminExist && checkNewUserExist) {
          const newNotification = await Notification.create({
            userId,
            notification: newCapitalizedNotification,
            type,
            priority,
            createdAt: Date.now(),
            senderId: senderId,
          });

          if (newNotification) {
            const allNewNotifications = await Notification.findAll({
              where: {
                userId,
                viewed: false,
              },
            });
            const allNewNotificationCount = await Notification.count({
              where: {
                userId,
                viewed: false,
              },
            });

            if (allNewNotificationCount && allNewNotifications) {
              if (receiver) {
                io.to(receiver.socketId).emit(
                  "receiveFromSingleNotificationAdmin",
                  {
                    notifications: allNewNotifications,
                    notificationCount: allNewNotificationCount,
                  }
                );
              }
            }
          }
        }
      }
    }
  );

  socket.on(
    "sendToAllUsers",
    async ({ notification, type, priority, senderId }) => {
      try {
        let role = "User";
        const newCapitalizedNotification = CapitalizeFirstLetter(notification);
        if (notification && type && priority && senderId) {
          const checkNewAdminExist = await Admin.findOne({
            where: { id: senderId },
          });

          if (!checkNewAdminExist) {
            console.error("Admin not found.");
            return;
          }
          const users = await User.findAll({
            attributes: ["id"],
          });

          if (users.length === 0) {
            console.error("No users found.");
            return;
          }

          const notifications = users.map((user) => ({
            userId: user.id,
            notification: newCapitalizedNotification,
            senderId,
            type,
            priority,
            createdAt: Date.now(),
            viewed: false,
          }));

          await NotificationHistory.create({
            notification: newCapitalizedNotification,
            createdAt: Date.now(),
            senderId,
            type,
            priority,
          });
          await Notification.bulkCreate(notifications);

          for (const user of users) {
            const userNotifications = await Notification.findAll({
              where: {
                userId: user.id,
                viewed: false,
              },
            });

            const userNotificationCount = await Notification.count({
              where: {
                userId: user.id,
                viewed: false,
              },
            });

            const userSocket = getUser(user.id, role);
            if (userSocket) {
              io.to(userSocket.socketId).emit("receiveFromAllNotification", {
                notifications: userNotifications,
                notificationCount: userNotificationCount,
              });
            }
          }
        }
      } catch (error) {
        console.error("Error sending notifications:", error);
      }
    }
  );
  // message is still a notification
  socket.on(
    "send-message-chat-module",
    async ({ recieverId, message, senderId }) => {
      try {
        let role = "User";
        const newCapitalizedMessage = CapitalizeFirstLetter(message);
        const receiver = getUser(recieverId, role);
        if (recieverId && message && senderId) {
          const checkNewSender = await User.findOne({
            where: {
              id: senderId,
            },
          });
          const checkNewReciever = await User.findOne({
            where: {
              id: recieverId,
            },
          });
          if (checkNewSender && checkNewReciever) {
            const newMessage = await Message.create({
              recieverId,
              senderId,
              message: newCapitalizedMessage,
              viewed: false,
              createdAt: Date.now(),
            });

            if (newMessage) {
              if (receiver) {
                io.to(receiver.socketId).emit(
                  "recieve-message-chat-module",
                  newMessage
                );
                const messageCount = await Message.count({
                  where: {
                    recieverId,
                    viewed: false,
                  },
                });
                if (messageCount) {
                  const senderName = await User.findOne({
                    where: {
                      id: senderId,
                    },
                  });
                  await Notification.create({
                    userId: recieverId,
                    notification: `You have a new message from ${senderName.firstName}`,
                    type: "Alert",
                    priority: "High",
                    createdAt: Date.now(),
                    senderId,
                    viewed: false,
                  });
                  io.to(receiver.socketId).emit("recieve-message-app-module", {
                    messageNotification: newMessage.message,
                    messageNotificationCount: messageCount,
                  });
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error sending notifications:", error);
      }
    }
  );

  socket.on(
    "sendToAllAdmin",
    async ({ notification, type, priority, senderId }) => {
      try {
        let role = "Admin";
        const newCapitalizedNotification = CapitalizeFirstLetter(notification);
        if (notification && type && priority && senderId) {
          const checkNewUserExist = await User.findOne({
            where: { id: senderId },
          });

          if (!checkNewUserExist) {
            console.error("User not found.");
            return;
          }
          const users = await Admin.findAll({
            attributes: ["id"],
          });

          if (users.length === 0) {
            console.error("No admins found.");
            return;
          }

          const notifications = users.map((user) => ({
            userId: user.id,
            notification: newCapitalizedNotification,
            senderId,
            type,
            priority,
            createdAt: Date.now(),
            viewed: false,
          }));

          await AdminNotification.bulkCreate(notifications);

          for (const user of users) {
            const adminNotifications = await AdminNotification.findAll({
              where: {
                userId: user.id,
                viewed: false,
              },
            });

            const adminNotificationCount = await AdminNotification.count({
              where: {
                userId: user.id,
                viewed: false,
              },
            });

            const adminSocket = getUser(user.id, role);
            if (adminSocket) {
              io.to(adminSocket.socketId).emit("receiveFromAllNotification", {
                notifications: adminNotifications,
                notificationCount: adminNotificationCount,
              });
            }
          }
        }
      } catch (error) {
        console.error("Error sending notifications:", error);
      }
    }
  );

  socket.on("disconnect", () => {
    removeUser(socket.id);
    console.log("A user disconnected");
  });
});

sequelize
  .sync()
  .then(() => {
    console.log("Database connected");
  })
  .catch((error) => {
    console.error("Error synchronizing database:", error);
  });

const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
