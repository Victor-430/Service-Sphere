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
      if (search) {
        query.search = search;
      }

      // pagination
      const skip = (Number(page) - 1) * Number(limit);
      const sortOrder = order === "desc" ? -1 : 1;

      // Execute query
      const services = await Service.find(query)
        .populate(
          "expertId",
          "firstName lastName rating totalReview profileImage isVerified",
        )
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(Number(limit))
        .lean();

      // get total count for pagination
      const total = await Service.countDocument(query);

      res.status(200).json({
        success: true,
        data: {
          services,
          pagination: {
            currentPage: Number(page),
            totalPage: Math.ceil(total / Number(limit)),
            totalServices: total,
          },
        },
      });
    } catch (error) {
      console.error("Get all services error:", error);
      res.status(500).json({
        message: "Failed to get all services ",
      });
    }
  },

  // get service by id
  getServiceById: async (req, res) => {
    try {
      const { id } = req.params;

      const service = await Service.findById(id)
        .populate(
          "expertId",
          "firstName lastName profileImage bio rating totalReviews isVerified location skills certifications",
        )
        .populate({
          path: "applications",
          match: { status: "pending" },
          select: "clientId message proposedPrice proposedTimeline createdAt",
          populate: {
            path: "clientId",
            select: "firstName lastName profileImage",
          },
        });

      if (!service) {
        console.error("service error:", error);
        res.status(404).json({
          message: "service not found",
        });
      }

      // increment view count asynchronously
      if (
        !req.user ||
        req.user._id.toString() !== service.expertId._id.toString()
      ) {
        service
          .incrementViews()
          .catch((error) => console.error("Failed to increment views:", error));
      }

      res.status(200).json({
        data: { service },
      });
    } catch (error) {
      console.error("get service id error:", error);
      res.status(500).json({
        message: "Failed to get service by id",
      });
    }
  },

  // update service (Expert only should update their service)
  updateService: async (req, res) => {
    try {
      const errors = validationResult();
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation error",
          errors: errors.array(),
        });
      }

      const { id } = req.params;

      // find service
      const service = await Service.findBy(id);

      if (!service) {
        res.status(404).json({
          message: "Service not found",
        });
      }

      // check ownership
      if (req.user._id.toString() !== service.expertId.toString()) {
        return res.status(403).json({
          message: "You can only update your own services",
        });
      }

      // Fields that can be updated
      const allowedUpdates = [
        "title",
        "description",
        "category",
        "subcategory",
        "pricing",
        "duration",
        "requirements",
        "images",
        "status",
        "location",
        "tags",
      ];

      allowedUpdates.forEach((field) => {
        if (req.body[field] !== undefined) {
          service[field] = req.body[field];
        }
      });

      await service.save();

      await service.populate(
        "expertId",
        "firstName lastName profileImage rating totalReviews",
      );

      res.status(200).json({
        message: "Service updated successfully",
        data: { service },
      });
    } catch (error) {
      console.error("update service error:", error);
      res.status(500).json({
        message: "Failed to update service",
      });
    }
  },

  // delete service (Expert only should delete their services)
  deleteService: async (req, res) => {
    try {
      const errors = validationResult();
      if (!errors.isEmpty()) {
        return res.status(403).json({
          message: "Validation error",
          errors: errors.array(),
        });
      }

      const service = Service.findById(id);

      if (!service) {
        res.status(404).json({
          message: "Service not found",
        });
      }
      // check ownership
      if (service.expertId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message: "you can only delete your own services",
        });
      }

      const isPending = await Application.countDocument({
        serviceId: id,
        status: "pending",
      });

      if (isPending > 0) {
        return res.status(400).json({
          message: "Please close all pending applications",
        });
      }

      await Service.findByIdAndDelete(id);

      res.status(200).json({
        message: "Application successfully deleted",
      });
    } catch (error) {
      console.error("Delete service error:", error);
      res.status(500).json({
        message: "Failed to delete service",
      });
    }
  },

  // get services by expert
  getExpertServices: async (req, res) => {
    try {
      const { expertId } = req.params;
      const { status, page = 1, limit = 10 } = req.query;

      const query = { expertId };
      if (status) query.status = status;

      const skip = (Number(page) - 1) * Number(limit);

      const services = await Service.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();

      const total = await Service.countDocument(query);

      res.status(200).json({
        data: {
          services,
          pagination: {
            totalServices: total,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
          },
        },
      });
    } catch (error) {
      (console.error("Get expert service error:", error),
        res.status(error).json({
          message: "Failed to get Expert Service",
        }));
    }
  },

  //apply to a service (client only)
  applyToService: async (req, res) => {
    try {
      const errors = validationResult();

      if (!errors.isEmpty()) {
        return res.status(403).json({
          message: "Validation Error",
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const { message, proposedPrice, proposedTimeline } = req.body;

      // check if service exist and is active
      const service = await Service.findById(id);

      if (!service) {
        return res.status(404).json({
          message: "Service not found",
        });
      }

      if (service.status !== "active") {
        return res.status(400).json({
          message: "This service is not accepting applications",
        });
      }

      // check if the user is trying to apply to thier own service
      if (req.user._id.toString() !== service.expertId.toString()) {
        return res.status(400).json({
          message: "You can not apply to your own service",
        });
      }

      // check if already applied
      const existingApplication = await Application.findOne({
        serviceId: id,
        clientId: req.user._id,
      });

      if (existingApplication) {
        return res.status(400).json({
          message: "You have already applied to this service",
        });
      }

      // create application
      const application = new Application({
        serviceId: id,
        clientId: req.user._id,
        expertId: service.expertId,
        message,
        proposedTimeline,
        proposedPrice,
      });

      await new application.save();

      await application.populate([
        { path: "clientId", select: "firstName lastName profileImage" },
        { path: "serviceId", select: "title " },
      ]);
      res.status(200).json({
        message: "Application submitted successfully",
        data: { application },
      });
    } catch (error) {
      console.error("Apply to service error:", error);
      res.status(500).json({
        message: "Application to service failed",
      });
    }
  },

  // get service applications (Expert should view only their service)
  getServiceApplication: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.query;

      // check if the service belongs to the expert
      const service = await Service.findById(id);

      if (!service) {
        return res.status(404).json({
          message: "Service not found",
        });
      }
      if (req.user._id() !== service.expertId.toString()) {
        return res.status(403).json({
          message: "You can only view applications for your own services",
        });
      }

      const query = { serviceId: id };
      if (status) query.status = status;

      const applications = await Application.findById(query)
        .populate(
          "clientId",
          "firstName lastName profileImage rating totalReviews",
        )
        .sort({ createdAAt: -1 });

      res.status(200).json({ applications });
    } catch (error) {
      console.error("Get service apllication error:", error);
      res.status(500).json({
        message: "Failed to get service application",
      });
    }
  },
};

export default serviceController;
