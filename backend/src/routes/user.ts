import express, { type Request, type Response } from "express";
import { userModel } from "../models/schema.js";
import { SignUpSchema,SignInSchema } from "../validation/validation.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { authMiddleware } from "../middleware/middleware.js";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET!;
const router = express.Router();
interface authRequest extends Request{
    userId? : string;
}

router.post("/signup",async(req:Request,res:Response)=>{
    try{
        console.log("i am here..>!");
        const {name,email,role,password } = req.body;
        const isValid = SignUpSchema.safeParse(req.body);
        if(!isValid.success){
            return res.status(400).json({
                "success" : false,
                "error" : "Invalid request schema"
            })
        };
        console.log("i am here2..>!");
        // const isUserExist = await userModel.findOne({email : email});
        const isUserExist = await userModel.findOne({email : email});
        console.log("isUser exist",isUserExist);
        if(isUserExist){
            res.status(200).json({
                "success" : false,
                "data" : "Email Already Exists!"
            });
            return;
        }
        console.log("here i am?");
        const newUser = await userModel.create({
            name : name,
            email : email,
            role : role,
            password : password

        });
        // await newUser.save();
        res.status(200).json({
            "success":"true",
            "data":{
                "_id" : newUser._id,
                "name" : newUser.name,
                "email" : newUser.email,
                "role" : newUser.role
            }
        })

    }catch(error){
        return res.status(400).json({ msg : "something went wrong."});
    }
})


router.post("/login",async(req:Request,res:Response)=>{
    try{
        const { email,password } = req.body;
        const isValid = SignInSchema.safeParse(req.body);
        if(!isValid.success){
            res.status(400).json({
                "success" : false,
                "error" : "Invalid request schema",
            });
            return;
        }
        const user = await userModel.findOne({email : email});
        if(!user){
            res.status(400).json({
                "success":false,
                "data" : "user not Found!"
            });
            return;
        }
        if(password !== user.password){
            res.status(400).json({
                "success":false,
                "error":"Invalid email or password"
            });
            return;
        }

        const token = jwt.sign({userId : user.id},JWT_SECRET);
        res.status(200).json({
            "success": true,
            "data":{
                "token": token
            }
        });
        return;

    }catch(error){
        res.status(400).json({error : "something went wrong!"});
        return;
    }
})

router.get("/me",authMiddleware,async(req:authRequest,res:Response)=>{
    try{
        const userId = req.userId;
        const user = await userModel.findOne({_id : userId});
        if(!user){return};
        res.status(200).json({
            "success":true,
            "data":{
                "_id":user._id,
                "name":user.name,
                "email":user.email,
                "role":user.role
            }
        });
        return;
    }catch(error){
        res.status(400).json({
            "success":false,
            "error":"something went wrong..!"
        });
    }
})



export default router;