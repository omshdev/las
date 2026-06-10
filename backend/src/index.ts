import express from "express";
import {WebSocket,WebSocketServer} from "ws";

import authRoutes from "./routes/user.js"
import { initWs } from "./ws.js";
import { connectDb } from "./models/db.js";
const app = express();

app.use(express.json());
app.use("/auth",authRoutes);


// wss.on('connection',async(ws:WebSocket)=>{
//     if(ws.on === "Read  ")
//     ws.on('message',async function message(data:any){
//         const msg = JSON.parse(data);
//     });
// })

connectDb();
initWs();


app.listen(3000,()=>console.log("Server Started at 3000"));
