import mongoose from "mongoose";
const DB_URI = process.env.DB_URI;
if (!DB_URI) {
  throw new Error("Please define the DB_URI environment variable");
}
async function dbConnect() {
  try {
    await mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}
export default dbConnect;
