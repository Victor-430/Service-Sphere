import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    expertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Expert Id is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Service title is required"],
      trim: true,
      minlength: [10, "Title must be at least 10 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Service description is required"],
      minlength: [50, "Description must be at least 50 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "web development",
        "mobile development",
        "graphic design",
        "content writing",
        "digital marketing",
        "video editing",
        "consulting",
        "legal",
        "accounting",
        "tutoring",
        "other",
      ],
    },
    subcategory: {
      type: String,
      trim: true,
    },
    pricing: {
      type: {
        type: String,
        enum: ["fixed", "hourly", "negotiable"],
        default: "fixed",
      },
      amount: {
        type: Number,
        min: [0, "Amount cannot be negative"],
      },
      currency: {
        type: String,
        default: "USD",
        uppercase: true,
      },
    },
    duration: {
      type: String,
      required: [true, "Duration is required"],
      trim: true,
    },
    requirements: [String],
    tags: [String],
    images: {
      type: [String],
      validate: {
        validator: function (v) {
          return v.length <= 5;
        },
        message: "Maximum 5 images allowed",
      },
    },
    status: {
      type: String,
      enum: ["active", "paused", "completed", "cancelled"],
      default: "active",
    },
    location: {
      type: {
        type: String,
        enum: ["remote", "onsite", "hybrid"],
        default: "remote",
      },
      address: String,
      city: String,
      state: String,
      country: String,
    },
    applicationsCount: {
      type: Number,
      default: 0,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

serviceSchema.index({ expertId: 1, status: 1 });
serviceSchema.index({ category: 1, status: 1 });
serviceSchema.index({ tags: 1 });
serviceSchema.index({ createdAt: -1 });
serviceSchema.index({ title: "text", description: "text", tags: "text" });

serviceSchema.virtual("applications", {
  ref: "Application",
  localField: "_id",
  foreignField: "serviceId",
});

serviceSchema.virtual("expert", {
  ref: "User",
  localField: "expertId",
  foreignField: "_id",
  justOne: true,
});

serviceSchema.pre("save", function (next) {
  if (this.pricing.type !== "negotiable" && !this.pricing.amount) {
    return next(new Error("Amount is required for fixed and hourly pricing"));
  }
  next();
});

// increment views
serviceSchema.methods.incrementViews = async function () {
  this.viewsCount += 1;
  return this.save();
};

// method to  get active services
serviceSchema.statics.getActiveServices = function (filters = {}) {
  return this.find({ ...filters, status: "active" })
    .populate("expertId", "firstName lastName profileImage rating totalReviews")
    .sort({ createdAt: -1 });
};

const Service = mongoose.model("Service", serviceSchema);

export default Service;
