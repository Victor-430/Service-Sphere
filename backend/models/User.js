import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: ["Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      default: "client",
      enum: ["client", "expert", "admin"],
    },
    profileImage: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"], //reg exp
    },
    phone: {
      type: String,
      match: ["Please enter a valid phone number"],
    },
    location: {
      address: String,
      city: String,
      state: String,
      country: String,
      coordinates: [Number], //[long,lat]
    },
    skills: [String], //for experts
    certification: [String], //for experts
    isVerified: {
      type: Boolean,
      deafult: false,
    },
    isActive: {
      type: Boolean,
      deafult: false,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalReview: {
      type: Number,
      default: 0,
    },
    emailVerificationToken: String,
    emailVerifiedAt: Date,
    passwordRestToken: String,
    passwordResetExpires: Date,
    lastLoginAt: Date,
  },
  { timestamps: true },
);

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ "location.coordinates": "2dsphere" });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePasswords = async function (pass) {
  return bcrypt.compare(pass, this.password);
};

userSchema.methods.generatePasswordResetToken = async function () {
  const crypto = await import("crypto");
  const token = crypto.randomBytes(32).toString("hex");
  this.passwordRestToken = token;
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //expires 10 minutes
  return token;
};

userSchema.methods.generateEmailVerificationToken = async function () {
  const crypto = await import("crypto");
  const token = crypto.randomBytes(32).toString("hex");
  this.emailVerificationToken = token;
  return token;
};

userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastname}`;
});

userSchema.set("toJSON", { virtual: true });
userSchema.set("toObject", { virtual: true });

const User = mongoose.model("User", userSchema);

export default User;
