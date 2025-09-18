const userModel = () => {};

export default userModel;


// Handles both clients and experts with role differentiation
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String,
  password: String, // hashed
  role: String, // 'client', 'expert', 'admin'
  profileImage: String,
  bio: String,
  phone: String,
  location: {
    address: String,
    city: String,
    state: String,
    country: String,
    coordinates: [Number] // [longitude, latitude]
  },
  skills: [String], // for experts
  certifications: [String], // for experts
  isVerified: Boolean,
  isActive: Boolean,
  rating: Number,
  totalReviews: Number,
  createdAt: Date,
  updatedAt: Date
}