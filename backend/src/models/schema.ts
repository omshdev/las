import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required:true,
        trim : true,
        maxLength:50
    },
    role : {
        enum: ["teacher","student"],
        required : true,
        type : String
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required:true
    }
});

const classSchema = new mongoose.Schema({
    className : {
        type : String,
        required : true,
        maxLength : 30,
        trim : true
    },
    teacherId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Users",
        required : true
    },
    studentIds : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Users",
        required : true
    }]
});

const attendenceScheama = new mongoose.Schema({
    classId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Class",
        required : true
    },
    studentId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Users",
        required : true
    },
    status : {
        enum : ["present" , "absent" ],
        required : true,
        type : String
    }
});


export const userModel = mongoose.model("Users",userSchema);
export const classModel =  mongoose.model("Class",classSchema);
export const attendenceModel = mongoose.model("Attendance",attendenceScheama);
