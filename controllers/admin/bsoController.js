const BSO = require("../../models/bso");
const CapitalizeFirstLetter = require("../../utils/shared/capitalizeFirstLetter");

exports.create = async (req, res) => {
  try {
    let { name, type, contactNumber, website, email, description, logo } =
      req.body;

    if (
      name === "" ||
      type === "" ||
      contactNumber === "" ||
      website === "" ||
      email === "" ||
      description === ""
    ) {
      res.status(400).json({
        status: "FAILURE",
        message: "Empty input fields",
      });
    } else {
      name = CapitalizeFirstLetter(name);
      type = CapitalizeFirstLetter(type);
      description = CapitalizeFirstLetter(description);
      const bso = await BSO.findOne({
        where: {
          name,
        },
      });
      if (bso) {
        res.status(409).json({
          status: "FAILURE",
          message: "Bso already exist!",
          data: bso,
        });
      } else {
        const newBso = await BSO.create({
          name,
          type,
          contactNumber,
          website,
          email,
          description,
          logo,
        });
        if (newBso) {
          res.status(201).json({
            status: "SUCCESS",
            message: "Bso successfully created!",
          });
        } else {
          res.status(500).json({
            status: "FAILURE",
            message: "Internal server error.",
          });
        }
      }
    }
  } catch (error) {
    res.status(500).json({
      status: "FAILURE",
      message: "Internal server error: " + error.message,
    });
  }
};
exports.all = async (req, res) => {
  try {
    const bsos = await BSO.findAll();
    if (bsos) {
      res.status(201).json({
        status: "SUCCESS",
        message: "Bso successfully created!",
        data: bsos,
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
      const bso = await BSO.findOne({
        where: {
          id,
        },
      });

      if (bso) {
        res.status(200).json({
          status: "SUCCESS",
          message: "Bsos successfully retrieved!",
          data: bso,
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
    let { name, type, contactNumber, website, email, description } = req.body;
    name = CapitalizeFirstLetter(name);
    type = CapitalizeFirstLetter(type);
    description = CapitalizeFirstLetter(description);

    const bso = await BSO.findOne({
      where: { id },
    });

    if (!bso) {
      return res.status(404).json({
        status: "FAILURE",
        message: "BSO with the provided id does not exist.",
      });
    }

    if (name !== bso.name) {
      const existingBso = await BSO.findOne({
        where: { name },
      });

      if (existingBso) {
        return res.status(409).json({
          status: "FAILURE",
          message: "BSO name already exists.",
        });
      }
    }

    const updatedBso = await bso.update({
      name,
      type,
      contactNumber,
      website,
      email,
      description,
      
    });

    if (updatedBso) {
      return res.status(200).json({
        status: "SUCCESS",
        message: "BSO successfully updated!",
      });
    } else {
      return res.status(500).json({
        status: "FAILURE",
        message: "Failed to update BSO.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "FAILURE",
      message: "Internal server error: " + error.message,
    });
  }
};

exports.updateImage = async (req, res) => {
  try {
    let { id } = req.params;
    let { logo } = req.body;

    const bso = await BSO.findOne({
      where: {
        id,
      },
    });

    if (bso) {
      const newBso = await BSO.update(
        {logo},
        {where: {
            id
        }}
      );

      if (newBso) {
        res.status(200).json({
          status: "SUCCESS",
          message: "Bso logo successfully updated!",
        });
      } else {
        res.status(500).json({
          status: "FAILURE",
          message: "Internal server error.",
        });
      }
    } else {
      res.status(404).json({
        status: "FAILURE",
        message: "Bso with the provided id does not exist.",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "FAILURE",
      message: "Internal server error: " + error.message,
    });
  }
};
exports.totalBsos = async (req, res) => {
  try {
    const totalBso = await BSO.count();
    if (totalBso) {
      res.status(200).json({
        status: "SUCCESS",
        message: "Bso count successfully retrieved!",
        data: totalBso,
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
exports.delete = async (req, res) => {
  try {
    let { id } = req.params;

    if (id === "") {
    return res.status(400).json({
        status: "FAILURE",
        message: "Empty parameter",
      });
    } else {
      const bso = await BSO.findOne({
        where: {
          id,
        },
      });
      if (bso) {
        await BSO.destroy({
          where: {
            id,
          },
        });
        res.status(200).json({
          status: "SUCCESS",
          message: "Bso successfully deleted!",
        });
      } else {
        res.status(404).json({
          status: "FAILURE",
          message: "Bso with the provided id does not exist.",
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
