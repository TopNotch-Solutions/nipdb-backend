const MobileImage = require("../../models/mobileImage");

exports.create = async (req, res) => {
  try {
    let { mobileImage } = req.body;

    if (!mobileImage) {
      return res.status(400).json({
        status: "FAILURE",
        message: "Empty input fields",
      });
    }

    const imageCount = await MobileImage.count();

    if (imageCount >= 10) {
      return res.status(403).json({
        status: "FAILURE",
        message: "Image limit number set to 10.",
      });
    }

    const newImage = await MobileImage.create({
      mobileImage,
    });

    if (newImage) {
      return res.status(201).json({
        status: "SUCCESS",
        message: "App image successfully created!",
      });
    } else {
      return res.status(500).json({
        status: "FAILURE",
        message: "Internal server error.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "FAILURE",
      message: "Internal server error: " + error.message,
    });
  }
};

exports.all = async (req, res) => {
  try {
    const mobileImage = await MobileImage.findAll();
    if (mobileImage) {
      res.status(201).json({
        status: "SUCCESS",
        message: "Images successfully retrieved!",
        data: mobileImage,
      });
    } else {
      res.status(500).json({
        status: "FAILURE",
        message: "Internal server error.",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "FAILURE",
      message: "Internal server error: " + error.message,
    });
  }
};
exports.single = async (req, res) => {
  try {
    const id = req.params.id;

    if (id === "") {
      res.status(400).json({
        status: "FAILURE",
        message: "Empty parameter",
      });
    } else {
      const mobileImage = await MobileImage.findOne({
        where: {
          id,
        },
      });

      if (mobileImage) {
        res.status(200).json({
          status: "SUCCESS",
          message: "Bsos successfully retrieved!",
          data: mobileImage,
        });
      } else {
        res.status(500).json({
          status: "FAILURE",
          message: "Internal server error.",
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
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const newMobileImage = req.body;
    const mobileImage = await MobileImage.findOne({
      where: { id },
    });

    if (!mobileImage) {
      return res.status(404).json({
        status: "FAILURE",
        message: "Image with the provided id does not exist.",
      });
    }

    const existingMobileImage = await MobileImage.findOne({
      where: { id },
    });

    if (!existingMobileImage) {
      return res.status(404).json({
        status: "FAILURE",
        message: "Image with the provided does not exists.",
      });
    }

    const updatedMobileImage = await MobileImage.update(
      { newMobileImage },
      {
        where: {
          id,
        },
      }
    );

    if (updatedMobileImage) {
      return res.status(200).json({
        status: "SUCCESS",
        message: "Image successfully updated!",
      });
    } else {
      return res.status(500).json({
        status: "FAILURE",
        message: "Failed to update image.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "FAILURE",
      message: "Internal server error: " + error.message,
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const mobileImage = await MobileImage.findOne({
      where: { id },
    });

    if (!mobileImage) {
      return res.status(404).json({
        status: "FAILURE",
        message: "Image with the provided id does not exist.",
      });
    }

    const deleteMobileImage = await MobileImage.destroy({
      where: { id },
    });

    if (deleteMobileImage) {
      return res.status(200).json({
        status: "SUCCESS",
        message: "Image successfully deleted!",
      });
    } else {
      return res.status(500).json({
        status: "FAILURE",
        message: "Failed to delete image.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "FAILURE",
      message: "Internal server error: " + error.message,
    });
  }
};
