import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "prisma/prisma.module";
import { RegisterDto } from "./dto/register.dto";
import * as bcrypt from 'bcrypt';
import { Role } from "@prisma/client";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtSecret: JwtService,
    ) {}

    async register(dto: RegisterDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        })

        if (existingUser) {
            throw new ConflictException("Email used");
        }

        const passwordHash = await bcrypt.hash(dto.password, 10);

        const newuser = await this.prisma.user.create({
            data: {
                fullName: dto.fullName,
                email: dto.email,
                passwordHash: passwordHash,
                role: Role.STUDENT,
            },
        })

        const { passwordHash: _, ...user } = newuser;

        return {
            message: "Create account success",
            user: user,
        }
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email }
        });

        if (!user) {
            throw new UnauthorizedException("Email is incorrect");
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

        if (!isPasswordValid) {
            throw new UnauthorizedException("Pass is incorrect");
        }

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        }

        const accessToken = await this.jwtSecret.signAsync(payload);

        const { passwordHash: _, ...userWithoutPassword } = user;

        return {
            accessToken,
            user: userWithoutPassword,
        };
    }

    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new UnauthorizedException("User is not found");
        }

        const { passwordHash: _, ...result } = user;

        return result;
    }
}