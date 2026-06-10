import express, { type Request, type Response } from "express";
import { authMiddleware } from "../middleware/middleware.js";
import { addStudentSchema, classIdSchema, ClassSchema } from "../validation/validation.js";
import { attendenceModel, classModel, userModel } from "../models/schema.js";

const router = express.Router();
interface AuthRequest extends Request{
    userId? : string;
    role? : string;
}

const sessions = [];
router.post('/class',authMiddleware,async(req:AuthRequest,res:Response)=>{
    try{
        const { className } = req.body;
        const isValid = ClassSchema.safeParse(req.body);
        if(!isValid.success) return res.status(400).json({ "success":false,"error":"Invalid request schema"});

        // allow only to teacher
        const userId = req.userId;
        if(!userId) return;
        const isValidRole = await userModel.findOne({_id: userId,role : "teacher"});
        if(!isValidRole) return res.status(400).json({ "error": "Forbidden, teacher access required"});
        // const newClass = await classModel.create({
        //     className : className,
        //     teacherId : userId,
        //     studentIds : []
        // });
        const newClass = await classModel.create({
            className : className,
            teacherId : userId,
            studentIds : []
        });
        await newClass.save();

        res.status(201).json({ "success":true,"data":{
            "_id":newClass._id,
            "ClassName":className,
            "teacherId":userId,
            "studentIds" : []
        }});
        return;
    }catch(error){
        res.status(400).json({ "success":false,"error":"Something Went Wrong..!"});
        return;
    }
});


router.post('/class/:id/add-student',authMiddleware,async(req:AuthRequest,res:Response)=>{
    try{
        const { studentId }= req.body;
        const isValid = addStudentSchema.safeParse(studentId)
        if(!isValid.success) return res.status(400).json({ "success":false,"error":"Invalid request schema"});

        const classId = req.params.id;
        const isClassExist = await classModel.findOne({classId : classId});
        if(!isClassExist) return res.status(400).json({ "success":false,"error": "Class not found"});
        
        const newStudent = await isClassExist.updateOne({ studentId : studentId});
        await newStudent.save();

        return res.status(201).json({ "success":true,"data":{
            "_id":classId,
            "className":isClassExist.className,
            "teacherId":newStudent.teacherId,
            "studentIds":newStudent.studentIds
        }});
    }catch(error){
        res.status(400).json({ "success":false,"error":"Error Message"});
        return;
    }
});

// todo how do i diffrentiate role based access....
router.get('/class/:id',authMiddleware,async(req:AuthRequest,res:Response)=>{
    try{
        const classId = req.params.id;
        const userId = req.userId;
        if(!userId) return;
        
        const userOfThatClass = await userModel.findOne({id : userId});


        const isClassExist = await classModel.findOne({classId : classId}).populate('studentIds');
        if(!isClassExist) return res.status(400).json({ "success": false,"error": "Class not found"});
        
        if(isClassExist.teacherId.toString() !== userId){
            res.status(403).json({ "success": false,
            "error": "Forbidden, not class teacher"
        });

        }
        const studentss : any = [];
        const students = isClassExist.studentIds.map((student:any)=>{
            studentss.push(student);
        })
        return res.status(200).json({ "success":true,
            "data":{
                "_id": isClassExist._id,
                "className": isClassExist.className,
                "teacherId" : isClassExist.teacherId,
                "students" : studentss
            }
        })
    }catch(error){
        res.status(400).json({"success": false, "error": "Error message",});
        return;
    }
});

router.get('/class/:id/my-attendense',authMiddleware,async(req:AuthRequest,res:Response)=>{
    try{
        const role = req.role;
        const classId : any = req.params.id;
        const userId = req.userId;
        if(!classId) return;
        if(!userId) return;
        
        if(role!=="student"){
            return res.json(400).json({success : false,data : "not a student."});
        }

        const classRoom = await classModel.findOne({
            _id : classId,
            studentIds : userId
        });

        if(!classRoom) return;
        const markAttendence = await attendenceModel.create({
            studentId : userId,
            classId : classId,
            status : "present"
        });
        await markAttendence.save();
        res.status(200).json({
            "success": true,
            "data": {
    "classId": classId,
    "status": "present"
  }})
    }catch(error){
        res.status(400).json({"success": false, "error": "Error message",});
        return;
    }
})

router.get('/students',authMiddleware,async(req:AuthRequest,res:Response)=>{
    try{
        const userId = req.userId;
        const role = req.role;
        if(role !== "teacher"){
            return res.status(403).json({"success": false, "error": "Forbidden, not class teacher"});
        }
        const students = await userModel.find({ role : "student"});
        if(students.length === 0){
            return res.status(404).json({
                "success":  false,
                error : "No Students found"
            });
        };
        return res.status(200).json({ 
            "success":true,
            "data":students
        });
        
    }catch(error){
        res.status(400).json({"success": false, "error": "Error message",});
        return;
    }
});

router.post("/attendance/start",authMiddleware,async(req:AuthRequest,res:Response)=>{
    try{
        // teacher only
        // must own the class
        const userRole = req.role;
        
        if(userRole === "student"){
            return res.status(403).json({   "success": false, "error": "Forbidden, not class teacher"});
        }
        const { classId } = req.body;
        const isValidClassId = classIdSchema.safeParse(req.body);
        if(!isValidClassId.success) return res.status(400).json({ "success":false,"error":"Invalid request schema"});
        const session = {classId : classId,startedAt : new Date().toISOString(),attendense:{}};
        sessions.push(session);
        res.status(200).json({ "success":true,"data":{"classId":session.classId,"startedAt":session.startedAt}});
        return;
        
    }catch(error){
        return res.status(400).json({ error : error});
    }
})
export default router;