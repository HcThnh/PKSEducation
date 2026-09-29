import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { PrismaModule } from "prisma/prisma.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { CoursesModule } from "src/courses/courses.module";

@Module({
    imports: [
        PrismaModule,
        PassportModule,
        JwtModule.registerAsync({
            useFactory: () => ({
                secret: process.env.JWT_SECRET || 'PKS_EDUCATION_SUPER_SECRET_KEY_2026',
                signOptions: {
                    expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as any,
                },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService],
})

export class AuthModule {}