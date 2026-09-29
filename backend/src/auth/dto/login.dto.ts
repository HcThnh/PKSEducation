import { IsEmail, IsNotEmpty } from "class-validator";

export class LoginDto {
    @IsNotEmpty({ message: "Email is not empty" })
    @IsEmail({}, { message: "Email is not valid" })
    email: string;

    @IsNotEmpty({ message: "Password is not empty" })
    password: string;
}