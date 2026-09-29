import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateCourseDto {
    @IsNotEmpty({ message: "Title is required"})
    @IsString()
    title: string;

    @IsNotEmpty({ message: "Category is required" })
    @IsString()
    category: string;

    @IsNotEmpty({ message: "instructor is required" })
    @IsString()
    instructor: string;

    @IsNotEmpty({ message: "Short Description is required"})
    @IsString()
    shortDescription: string;

    @IsOptional()
    @IsString()
    fullDescription?: string;

    @IsNotEmpty({ message: "Fee is required" })
    @IsNumber()
    @Min(0, { message: "Fee must be 0 or greater" })
    fee: number;

    @IsNotEmpty({ message: "Max Capacity is required" })
    @IsNumber()
    @Min(1, { message: "Max Capacity must be 1 or greater" })
    maxCapacity: number;
}