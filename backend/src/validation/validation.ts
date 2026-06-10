import * as z from "zod";

export const SignUpSchema = z.object({
    name : z.string(),
    role : z.enum(["teacher","student"]),
    email : z.email(),
    password : z.string().min(8)
});

export const SignInSchema = z.object({
    email : z.email(),
    password : z.string().min(8)
});

export const ClassSchema = z.object({
    className : z.string()
});

export const classIdSchema = z.object({
    classId : z.string()
})
export const addStudentSchema = z.object({
    studentId : z.string()
});

