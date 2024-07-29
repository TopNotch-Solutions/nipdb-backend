const User = require("../../models/user");
const { createMobileToken } = require("../../utils/mobile/generateToken");
const CapitalizeFirstLetter = require("../../utils/shared/capitalizeFirstLetter");
const bcrypt = require("bcrypt");
const OTP = require("../../models/otpVerification");
const sendOTPVerification = require("../../utils/mobile/sendOtp");

exports.signup = async (req, res) => {
  let { firstName, lastName, email, password } = req.body;
  const role = "User";

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "Input fields empty" });
  } else {
    firstName = CapitalizeFirstLetter(firstName);
    lastName = CapitalizeFirstLetter(lastName);

    try {
      const checkNewUser = await User.findOne({ where: { email: email } });

      if (checkNewUser) {
        if (!checkNewUser.verified) {
          const subject = "In4MSME OTP Verification";
          await sendOTPVerification(checkNewUser, res, { subject });
        } else {
          return res.status(409).json({
            status: "FAILURE",
            message: "Email already exists",
            data: checkNewUser.id,
          });
        }
      } else {
        const salt = await bcrypt.genSalt();
        const newPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
          firstName,
          lastName,
          email,
          password: newPassword,
          role,
        });

        if (newUser) {
          const subject = "In4MSME OTP Verification";
          await sendOTPVerification(newUser, res, { subject });
        } else {
          return res.status(500).json({
            status: "FAILURE",
            message: "Failed to create new user",
          });
        }
      }
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ status: "FAILURE", message: "Internal Server Error", error });
    }
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { otp, userId, role } = req.body;

    if (!userId || !otp || !role) {
      return res
        .status(400)
        .json({ status: "FAILURE", message: "Input fields empty" });
    }

    const verifyUser = await OTP.findOne({
      where: { userId, role },
    });

    if (!verifyUser) {
      return res.status(404).json({
        status: "FAILURE",
        message:
          "Account record doesn't exist or has been verified already. Please sign up or login.",
      });
    }

    const { expiresAt, otp: hashedOTP } = verifyUser;
    console.log(verifyUser);

    if (role === "User") {
      if (expiresAt < Date.now()) {
        await OTP.destroy({
          where: { userId, role },
        });
        return res.status(400).json({
          status: "FAILURE",
          message: "Code has expired. Please request again.",
        });
      }
    } else {
      if (expiresAt < Date.now()) {
        await OTP.destroy({
          where: { userId, role },
        });
        return res.status(400).json({
          status: "FAILURE",
          message: "Link has expired.",
        });
      }
    }

    const validOTP = await bcrypt.compare(otp, hashedOTP);

    if (!validOTP) {
      return res.status(400).json({
        status: "FAILURE",
        message: "Invalid code passed. Check your inbox.",
      });
    }

    if (role === "User") {
      await User.update({ verified: true }, { where: { id: userId } });
      await OTP.destroy({
        where: { userId, role },
      });

      return res.status(200).json({
        status: "VERIFIED",
        message: "Operation successful based on the role.",
      });
    }
    {
      await OTP.destroy({
        where: { userId, role },
      });
      return res.status(200).json({
        status: "VERIFIED",
        message: "Link is valid.",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "FAILURE",
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
exports.verifyForgotOTP = async (req, res) => {
  try {
    const { otp, userId } = req.body;

    if (!userId || !otp) {
      return res
        .status(400)
        .json({ status: "FAILURE", message: "Input fields empty" });
    }

    const verifyUser = await OTP.findOne({
      where: { userId },
    });

    if (!verifyUser) {
      return res.status(404).json({
        status: "FAILURE",
        message:
          "Account record doesn't exist or has been verified already. Please sign up or login.",
      });
    }

    const { expiresAt, otp: hashedOTP } = verifyUser;

    if (expiresAt < Date.now()) {
      await OTP.destroy({
        where: { userId },
      });
      return res.status(400).json({
        status: "FAILURE",
        message: "Code has expired. Please request again.",
      });
    }

    const validOTP = await bcrypt.compare(otp, hashedOTP);

    if (!validOTP) {
      return res.status(400).json({
        status: "FAILURE",
        message: "Invalid code passed. Check your inbox.",
      });
    }
    await OTP.destroy({
      where: { userId },
    });

    return res.status(200).json({
      status: "VERIFIED",
      message: "User email verified successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "FAILURE",
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
exports.resendOTP = async (req, res) => {
  try {
    const { email, userId } = req.body;

    if (!userId || !email) {
      return res
        .status(400)
        .json({ status: "FAILURE", message: "Input fields empty" });
    }
    await OTP.destroy({
      where: {
        userId,
      },
    });
    const subject = "In4MSME OTP Resend Verification";
    await sendOTPVerification({ id: userId, email, role: "User" }, res, {
      subject,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "FAILURE", message: "Internal Server Error" });
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
      const user = await User.findOne({
        where: {
          email: email,
        },
      });

      if (user) {
        const existingUser = await bcrypt.compare(password, user.password);

        if (!existingUser) {
          return res
            .status(404)
            .json({ status: "FAILURE", message: "Invalid credentials" });
        }
        if (!user.verified) {
          return res
            .status(404)
            .json({ status: "FAILURE", message: "User not verified." });
        }
        if (user.role === "Admin" || user.role === "Super admin") {
          return res.status(404).json({
            status: "FAILURE",
            message: "User does not have access to this route",
          });
        }
        const currentUser = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profileImage: user.profileImage,
          role: user.role,
        };

        const token = createMobileToken(currentUser.id, currentUser.role);

        if (token) {
          console.log(token);
          res.status(200).json({
            status: "SUCCESS",
            message: "Login successful",
            token,
            currentUser,
          });
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

exports.forgotPasswordEmail = async (req, res) => {
  try {
    let { email } = req.body;

    if (!email) {
      return res
        .status(404)
        .json({ status: "FAILURE", message: "Input fields empty" });
    }
    const existingUser = await User.findOne({
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
    await sendOTPVerification({ id: userId, email, role: "User" }, res, {
      subject,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "FAILURE", message: "Internal Server Error" });
  }
};
exports.forgotPasswordNewPassword = async (req, res) => {
  try {
    let { newPassword, confirmPassword, userId } = req.body;

    if (!newPassword || !confirmPassword || !userId) {
      return res
        .status(400)
        .json({ status: "FAILURE", message: "Input fields empty" });
    }
    const existingUser = await User.findOne({
      where: {
        id: userId,
      },
    });
    if (!existingUser) {
      return res
        .status(404)
        .json({ status: "FAILURE", message: "User not found!" });
    }
    if (newPassword !== confirmPassword) {
      return res.status(404).json({
        status: "FAILURE",
        message: "New password and the Confirm password provided do not match.",
      });
    }
    const salt = await bcrypt.genSalt();
    const newPasswordHashed = await bcrypt.hash(newPassword, salt);
    await User.update(
      { password: newPasswordHashed },
      {
        where: {
          id: userId,
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
      .json({ status: "FAILURE", message: "Internal Server Error ", error });
  }
};
exports.forgotPasswordResendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ status: "FAILURE", message: "Input fields empty" });
    }
    const existingUser = await User.findOne({
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
    await OTP.destroy({
      where: {
        userId,
      },
    });
    const subject = "In4MSME Forgot Password Resend OTP Verification";
    await sendOTPVerification({ id: userId, email, role: "User" }, res, {
      subject,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "FAILURE", message: "Internal Server Error" });
  }
};
exports.changePassword = async (req, res) => {
  try {
    let { currentPassword, newPassword, confirmPassword } = req.body;
    let userId = req.user.id;

    if (!currentPassword || !newPassword || !confirmPassword || !userId) {
      return res
        .status(400)
        .json({ status: "FAILURE", message: "Input fields empty" });
    }
    const existingUser = await User.findOne({
      where: {
        id: userId,
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
        message: "Current password and the password provided do not match.",
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
    await User.update(
      { password: newPasswordHashed },
      {
        where: {
          id: userId,
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
      .json({ status: "FAILURE", message: "Internal Server Error ", error });
  }
};

exports.logout = async (req, res) => {
  try {
    res.status(200).json({ status: "SUCCESS", message: "User logged out" });
  } catch (error) {
    res
      .status(500)
      .json({ status: "FAILURE", message: "Internal Server Error" });
  }
};
