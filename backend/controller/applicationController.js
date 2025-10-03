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
};

export default applicationController;
