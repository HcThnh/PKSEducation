import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class RegisterDto {
    @IsNotEmpty({ message: "Please provide your full name" })
    @IsString({ message: "Full name must be a string" })
    fullName: string;

    @IsNotEmpty({ message: "Please provide your email" })
    @IsEmail({}, { message: "Please provide a valid email address" })
    email: string;

    @IsNotEmpty({ message: "Please provide your password" })
    @MinLength(6, { message: "Password must be at least 6 characters long" })
    password: string;
}