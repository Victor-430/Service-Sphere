import Application from "../models/Applications";

const applicationController = {
  // get user's application (Client view)
  getMyApplication: async (req, res) => {
    try {
      const { status, page = 1, limit = 10 } = req.query;

      const query = { clientId: req.user._id };
      if (status) query.status = status;

      const skip = (Number(page) - 1) * Number(limit);

      const applications = await Application.find(query)
        .populate("serviceId", "title category pricing status")
        .populate("expertId", "firstName lastName profile rating")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await Application.countDocuments(query);

      res.status(200).json({
        data: {
          applications,
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            total,
          },
        },
      });
    } catch (error) {
      console.error("Get my applications:", error);
      res.status(500).json({
        message: "Failed to fetch applications",
      });
    }
  },

  _updateAplicationStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, expertResponse } = req.body;

      const application = await Application.findById(id);

      if (!application) {
        return res.status(400).json({
          message: "Application error",
        });
      }
      // check if expert owns the service
      if (application.expertId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message: "You can only update applications for your services",
        });
      }

      application.status = status;
      if (expertResponse) {
        application.expertResponse = {
          message: expertResponse,
          respondedAt: new Date(),
        };
      }

      await application.save();

      await application.populate([
        { path: "clientId", select: "firstName lastName profileImage" },
        { path: "serviceId", select: "title" },
      ]);

      res.status(200).json({
        data: { application },
        message: "Application status updated",
      });
    } catch (error) {
      console.log("Update application status error:", error);
      res.status(500).json({
        message: "Failed to update application status",
      });
    }
  },
  get updateAplicationStatus() {
    return this._updateAplicationStatus;
  },
  set updateAplicationStatus(value) {
    this._updateAplicationStatus = value;
  },
};

export default applicationController;
