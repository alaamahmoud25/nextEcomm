import CredentialsProvider from "next-auth/providers/credentials";
import User from "@/models/user";
import bcrypt from "bcrypt";
import dbConnect from "@/utils/dbConnect";
export const authOptions = {
 session: {
 strategy: "jwt",
 },
 providers: [
 CredentialsProvider({
   async authorize(credentials, req) {
     await dbConnect();
 const { email, password } = credentials;
 const user = await User.findOne({ email });
 if (!user) {
 throw new Error("Invalid email or password");
 }
 // If the user has no password (i.e., they signed up via a social)
 if (!user?.password) {
 throw new Error("Please login via the method you used to sign up");
 }
 const isPasswordMatched = await bcrypt.compare(
 password,
 user?.password
 );
 if (!isPasswordMatched) {
 throw new Error("Invalid email or password");
 }
 return user;
 },
  }),
 ],
 secret: process.env.NEXT_AUTH_SECRET,
 pages: {
 signIn: "/login",
 },
};
