import mongoose from "mongoose";

const applicationShema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      index: true,
      required: [true, "Service Id is required"],
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: [true, "Client Id is required"],
    },
    expertId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
      ref: "User",
      required: [true, "ExpertId is required"],
    },
    message: {
      type: String,
      minlength: [20, "Message must be at least 20 characters"],
      maxlength: [1000, "Message cannot exceed 1000 characters"],
      required: [true, "Apllication message is required"],
    },
    proposedPrice: {
      type: number,
      min: [0, "Proposed price cannot be negative"],
    },
    proposedTimeline: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "withdrawn", "rejected"],
      default: pending,
    },
    attachments: [String],
    expertResponse: {
      message: String,
      respondedAt: Date,
    },
  },
  { timestamps: true },
);

const Application = new mongoose.model("Application", applicationShema);

export default Application;
