import express from "express";
import mongoose from "mongoose";

import authRoutes from "./routes/user.js"

const app = express();

app.use("/auth",authRoutes)


app.listen(3000,()=>console.log("Server Started at 3000"));
