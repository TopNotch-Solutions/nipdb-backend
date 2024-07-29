const Admin = require("../../models/admin");
const { createWebToken } = require("../../utils/web/generateToken");
const {
  createWebRefreshToken,
} = require("../../utils/web/generateRefreshToken");
const generateRandomString = require("../../utils/shared/generateRandomString");
const CapitalizeFirstLetter = require("../../utils/shared/capitalizeFirstLetter");
const bcrypt = require("bcrypt");
const { where } = require("sequelize");
const nodemailer = require("nodemailer");
const sendOTPVerification = require("../../utils/mobile/sendOtp");
const e = require("express");

exports.signup = async (req, res) => {
  let { firstName, lastName, email, department, contactNumber, role } =
    req.body;

  if (
    !req.body ||
    !firstName ||
    !lastName ||
    !email ||
    !role ||
    !department ||
    !contactNumber
  ) {
    return res
      .status(404)
      .json({ status: "FAILURE", message: "Input fields empty" });
  }

  const password = generateRandomString();
  firstName = CapitalizeFirstLetter(firstName);
  lastName = CapitalizeFirstLetter(lastName);
  department = CapitalizeFirstLetter(department);
  role = CapitalizeFirstLetter(role);

  try {
    const checkNewUser = await Admin.findOne({ where: { email } });

    if (checkNewUser) {
      return res
        .status(404)
        .json({ status: "FAILURE", message: "Email provided already exists" });
    }

    const salt = await bcrypt.genSalt();
    const newPassword = await bcrypt.hash(password, salt);

    const newUser = await Admin.create({
      firstName,
      lastName,
      email,
      password: newPassword,
      department,
      contactNumber,
      role,
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "In4Msme Portal Onboarding",
      html: `<p>${newUser.firstName} ${newUser.lastName}, Here is your password <b>${password}</b>. Do not share it with anyone.</p>`,
    };

    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        await Admin.destroy({ where: { email } });
        return res.status(500).json({
          status: "FAILURE",
          message: "Internal server error: " + error.message,
        });
      }
      res.status(201).json({
        status: "SUCCESS",
        message: "User successfully inserted. Email sent",
      });
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "FAILURE", message: "Internal Server Error", error });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(404)
      .json({ status: "FAILURE", message: "Input fields empty" });
  } else {
    try {
      const user = await Admin.findOne({
        where: {
          email: email,
        },
      });

      if (user) {
        if (user.role === "User") {
          return res.status(404).json({
            status: "FAILURE",
            message: "User does not have access to this route",
          });
        }
        const existingUser = await bcrypt.compare(password, user.password);

        if (existingUser) {
          const currentUser = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            department: user.department,
            profileImage: user.profileImage,
            contactNumber: user.contactNumber,
            role: user.role,
          };
          const token = createWebToken(currentUser.id, currentUser.role);
          const refreshToken = createWebRefreshToken(
            currentUser.id,
            currentUser.role
          );
          if (token) {
            res.cookie("jwt", token, {
              httpOnly: true,
              maxAge: 15 * 60 * 1000,
            });
            res.cookie("refreshToken", refreshToken, {
              httpOnly: true,
              maxAge: 30 * 60 * 1000,
            });
            console.log(token);
            res.status(200).json({
              status: "SUCCESS",
              message: "Login successful",
              currentUser,
            });
          } else {
            return res
              .status(500)
              .json({ message: "Server could not generate token" });
          }
        } else {
          return res
            .status(404)
            .json({ status: "FAILURE", message: "Invalid credentials" });
        }
      } else {
        return res
          .status(404)
          .json({ status: "FAILURE", message: "Invalid credentials" });
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ status: "FAILURE", message: "Internal Server Error" });
    }
  }
};
exports.currentUser = async (req, res) => {
  try {
    const { id } = req.user;
    const currentUser = await Admin.findOne({
      where: {
        id,
      },
    });
    if (currentUser) {
      const newUser = {
        id: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        department: currentUser.department,
        profileImage: currentUser.profileImage,
        contactNumber: currentUser.contactNumber,
        role: currentUser.role,
      };
      const token = createWebToken(currentUser.id, currentUser.role);
      const refreshToken = createWebRefreshToken(
        currentUser.id,
        currentUser.role
      );
      if (token) {
        res.cookie("jwt", token, { httpOnly: true, maxAge: 15 * 60 * 1000 });
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          maxAge: 30 * 60 * 1000,
        });
        console.log(token);
        res.status(200).json({
          status: "SUCCESS",
          message: "Login successful",
          currentUser: newUser,
        });
      } else {
        return res
          .status(500)
          .json({ message: "Server could not generate token" });
      }
    } else {
      res.status(404).json({
        status: "FAUILURE",
        message: "The user does not exist",
      });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "FAILURE", message: "Internal Server Error" });
  }
};
exports.forgotPassword = async (req, res) => {
  try {
    let { email } = req.body;

    if (!email) {
      return res
        .status(404)
        .json({ status: "FAILURE", message: "Input fields empty" });
    }
    const existingUser = await Admin.findOne({
      where: {
        email,
      },
    });
    if (!existingUser) {
      return res
        .status(404)
        .json({ status: "FAILURE", message: "User not found!" });
    }
    let userId = existingUser.id;
    console.log(userId);
    const subject = "In4MSME Forgot Password Verification";
    await sendOTPVerification({ id: userId, email, role: "Admin" }, res, {
      subject,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "FAILURE", message: "Internal Server Error" });
  }
};
exports.changePassword = async (req, res) => {
  try {
    let { id } = req.user;
    let { currentPassword, newPassword, confirmPassword } = req.body;
    console.log(confirmPassword, newPassword, confirmPassword);
    if (!currentPassword || !newPassword || !confirmPassword || !id) {
      return res
        .status(400)
        .json({ status: "FAILURE", message: "Input fields empty" });
    }
    const existingUser = await Admin.findOne({
      where: {
        id,
      },
    });
    if (!existingUser) {
      return res
        .status(404)
        .json({ status: "FAILURE", message: "User not found!" });
    }
    const isExisting = await bcrypt.compare(
      currentPassword,
      existingUser.password
    );
    if (!isExisting) {
      return res.status(404).json({
        status: "FAILURE",
        message: "Invalid current password!",
      });
    }
    if (newPassword !== confirmPassword) {
      return res.status(404).json({
        status: "FAILURE",
        message: "New password and the Confirm password provided do not match.",
      });
    }
    const salt = await bcrypt.genSalt();
    const newPasswordHashed = await bcrypt.hash(newPassword, salt);
    await Admin.update(
      { password: newPasswordHashed },
      {
        where: {
          id,
        },
      }
    );
    res.status(200).json({
      status: "SUCCESS",
      message: "User Password successfully updated",
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "FAILURE", message: `Internal Server Error: ${error} ` });
  }
};
exports.details = async (req, res) => {
  try {
    let { id } = req.user;
    let { firstName, lastName, email, contactNumber, department } = req.body;
    if (
      !firstName ||
      !lastName ||
      !email ||
      !contactNumber ||
      !department ||
      !id
    ) {
      return res
        .status(400)
        .json({ status: "FAILURE", message: "Input fields empty" });
    }
    const existingUser = await Admin.findOne({
      where: {
        id,
      },
    });
    if (!existingUser) {
      return res
        .status(404)
        .json({ status: "FAILURE", message: "User not found!" });
    }
    const newAdminDetails = await Admin.update(
      { firstName, lastName, email, contactNumber, department },
      {
        where: {
          id,
        },
      }
    );
    if (!newAdminDetails) {
      return res
        .status(404)
        .json({
          status: "FAILURE",
          message: "Something went wrong during details update",
        });
    }
    const newD = await Admin.findOne({
      where: {
        id,
      },
    });
    const newUser = {
      id: newD.id,
      firstName: newD.firstName,
      lastName: newD.lastName,
      email: newD.email,
      department: newD.department,
      profileImage: newD.profileImage,
      contactNumber: newD.contactNumber,
      role: newD.role,
    };
    res.status(200).json({
      status: "SUCCESS",
      message: "Admin details successfully updated!",
      currentUser: newUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "FAILURE", message: "Internal Server Error" });
  }
};
exports.profileImage = async (req, res) => {
  try {
    let { id } = req.user;
    let { profileImage } = req.body;
    if (!profileImage || !id) {
      return res
        .status(400)
        .json({ status: "FAILURE", message: "Input fields empty" });
    }
    const existingUser = await Admin.findOne({
      where: {
        id,
      },
    });
    if (!existingUser) {
      return res
        .status(404)
        .json({ status: "FAILURE", message: "User not found!" });
    }
    const newAdminDetails = await Admin.update(
      { profileImage },
      {
        where: {
          id,
        },
      }
    );
    if (!newAdminDetails) {
      return res
        .status(404)
        .json({
          status: "FAILURE",
          message: "Something went wrong during details update",
        });
    }
    const newD = await Admin.findOne({
      where: {
        id,
      },
    });
    const newUser = {
      id: newD.id,
      firstName: newD.firstName,
      lastName: newD.lastName,
      email: newD.email,
      department: newD.department,
      profileImage: newD.profileImage,
      contactNumber: newD.contactNumber,
      role: newD.role,
    };
    res.status(200).json({
      status: "SUCCESS",
      message: "Profile image successfully updated!",
      profileImage: newUser.profileImage,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "FAILURE", message: "Internal Server Error" });
  }
};
exports.logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 1 });
    res.cookie("refreshToken", "", { maxAge: 1 });
    res.status(200).json({ status: "SUCCESS", message: "User logged out" });
  } catch (error) {
    res
      .status(500)
      .json({ status: "FAILURE", message: "Internal Server Error" });
  }
};
exports.delete = async (req, res) => {
  try {
    const { id } = req.user; // Ensure `req.user` is set by authentication middleware
    const { email } = req.body;

    if (!email || !id) {
      return res
        .status(400)
        .json({ status: "FAILURE", message: "Input fields empty" });
    }

    const existingUser = await Admin.findOne({
      where: { email },
    });

    if (!existingUser) {
      return res
        .status(404)
        .json({ status: "FAILURE", message: "Admin not found!" });
    }

    await Admin.destroy({
      where: { email },
    });

    return res.status(200).json({
      status: "SUCCESS",
      message: "Admin successfully deleted",
    });

  } catch (error) {
    console.error("Error deleting admin:", error); 
    return res
      .status(500)
      .json({ status: "FAILURE", message: "Internal Server Error" });
  }
};
