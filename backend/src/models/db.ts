import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const DBURI = process.env.MONGOOSE_URI!;

export async function connectDb(){
    console.log("Mongoose Connecting..!",DBURI);
    await mongoose.connect(DBURI);
    console.log("Mongoose Connected..!",DBURI);
}
