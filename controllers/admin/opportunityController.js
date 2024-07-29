const { where } = require("sequelize");
const Opportunity = require("../../models/opportunity");

exports.create = async (req, res) => {
  try {
    let { name,category,description,user } = req.body;

    if (!name || !category || !description || !user) {
      return res.status(400).json({
        status: "FAILURE",
        message: "Empty input fields",
      });
    }

    const existingOpportunity = await Opportunity.findOne({
        where:{
            name
        }
    });
    if(existingOpportunity){
        return res.status(400).json({
            status: "FAILURE",
            message: "Opportunity already exist",
          });
    }

    const newOpportunity = await Opportunity.create({
      name,
      category,
      description,
      user,
      dateUploaded: Date.now()
    });

    if (newOpportunity) {
      return res.status(201).json({
        status: "SUCCESS",
        message: "Opportunity successfully created!",
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
    const allOpportunities = await Opportunity.findAll();
    if (allOpportunities) {
      res.status(201).json({
        status: "SUCCESS",
        message: "Opportunities successfully retrieved!",
        data: allOpportunities,
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
      const allOpportunity = await Opportunity.findOne({
        where: {
          id,
        },
      });

      if (allOpportunity) {
        res.status(200).json({
          status: "SUCCESS",
          message: "Opportunity successfully retrieved!",
          data: allOpportunity,
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
    const {name,category,description, user} = req.body;
    if (!name || !category || !description || !user) {
      res.status(400).json({
        status: "FAILURE",
        message: "Empty parameter",
      });
    }
    const existingOpportunity = await Opportunity.findOne({
      where: { id },
    });

    if (!existingOpportunity) {
      return res.status(404).json({
        status: "FAILURE",
        message: "Opportunity with the provided id does not exist.",
      });
    }

    const updatedOpportunity = await Opportunity.update(
      { name,category,description,user },
      {
        where: {
          id,
        },
      }
    );

    if (updatedOpportunity) {
      return res.status(200).json({
        status: "SUCCESS",
        message: "Opportunity successfully updated!",
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
    const opportunity = await Opportunity.findOne({
      where: { id },
    });

    if (!opportunity) {
      return res.status(404).json({
        status: "FAILURE",
        message: "Opportunity with the provided id does not exist.",
      });
    }

    const deleteOpportunity = await Opportunity.destroy({
      where: { id },
    });

    if (deleteOpportunity) {
      return res.status(200).json({
        status: "SUCCESS",
        message: "Opportunity successfully deleted!",
      });
    } else {
      return res.status(500).json({
        status: "FAILURE",
        message: "Failed to delete opportunity.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "FAILURE",
      message: "Internal server error: " + error.message,
    });
  }
};
