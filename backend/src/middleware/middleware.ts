import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { userModel } from "../models/schema.js";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;

interface authRequest extends Request{
    userId? : string;
    role? : string;
}
export async function authMiddleware(req:authRequest,res:Response,next:NextFunction){
    const authHeaders = req.headers.authorization;
    if(!authHeaders || !authHeaders.startsWith("Bearer ")) return;
    const token = authHeaders.split(' ')[1];
    if(!token) return;
    
    console.log('verifing token');
    const verifyToken:any= jwt.verify(token,JWT_SECRET);
    console.log('verifed token',verifyToken.userId);
    req.userId = verifyToken?.userId;
    const user : any = await userModel.findOne({_id:req.userId});
    req.role = user?.role;
    next();

}