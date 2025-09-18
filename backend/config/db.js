import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("reconnected", () => console.log("reconnected"));
    mongoose.connection.on("disconnected", () => console.log("disconnected"));

    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

export default connectDB;
