import { Body, Controller, Get, Post, Request, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";

@Controller("auth")
export class AuthController {
    constructor(private readonly authServie: AuthService) {}

    @Post("register")
    async register(@Body() dto: RegisterDto) {
        return this.authServie.register(dto);
    }

    @Post("login")
    async login(@Body() dto: LoginDto) {
        return this.authServie.login(dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get("profile")
    async getProfile(@Request() req: any) {
        return this.authServie.getProfile(req.user.id);
    }
}