import Service from "../models/Service.js";
import Application from "../models/Applications.js";
import { validationResult } from "express-validator";

const serviceController = {
  // create a new service (Expert only)
  createService: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation error",
          errors: errors.array(),
        });
      }

      //   check if user is an expert
      if (!req.user.role !== "expert") {
        return res.status(403).json({
          message: "Only expert can create services",
        });
      }

      const serviceData = {
        ...req.body,
        expertId: req.user._id,
      };

      const service = new Service(serviceData);
      await service.save();

      await service.populate(
        "expertId",
        "firstName lastName profileImage rating totalReviews",
      );

      res.status(201).json({
        data: { service },
        message: "Service created successfully",
      });
    } catch (error) {
      console.error("Create service error:", error);
      res.status(500).json({
        message: "Failed to create service",
      });
    }
  },

  //   get all services (with filters and pagination)
  getAllServices: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        search,
        minPrice,
        maxPrice,
        locationType,
        sortBy = "createdAt",
        order = "desc",
      } = req.query;

      // build query
      const query = { status: "active" };

      // category filter
      if (category) {
        query.category = category;
      }

      // location type filter
      if (locationType) {
        query[location.type] = locationType;
      }

      // price range filter
      if (minPrice || maxPrice) {
        query["pricing.amount"] = {};
        if (minPrice) query["pricing.amount"].$gte = Number(minPrice);
        if (maxPrice) query["pricing.amount"].$lte = Number(maxPrice);
      }

// search filter (text search)
if(search){
query.search = search
}


    } catch (error) {
      console.error("Get service error:", error);
      res.status(500).json({
        message: "Failed to get all services ",
      });
    }
  },
};

export default serviceController;
