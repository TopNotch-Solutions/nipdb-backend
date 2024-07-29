const Town = require("../../models/town");

exports.all = async (req, res) => {
  try {
    console.log(res.user);
    const town = await Town.findAll();
    if (town) {
      res.status(201).json({
        status: "SUCCESS",
        message: "Towns successfully retrieved!",
        data: town,
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
      const town = await Town.findOne({
        where: {
          id,
        },
      });

      if (town) {
        res.status(200).json({
          status: "SUCCESS",
          message: "town successfully retrieved!",
          data: town,
        });
      } else {
        res.status(404).json({
          status: "FAILURE",
          message: "The region provided does not exist.",
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
