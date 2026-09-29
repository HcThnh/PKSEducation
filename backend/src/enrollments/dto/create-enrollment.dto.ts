import { IsNotEmpty, IsString } from "class-validator";

export class CreateEnrollmentDto {
    @IsNotEmpty({ message: "Course Id is required" })
    @IsString()
    courseId: string;
}