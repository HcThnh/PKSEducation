import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { PrismaService } from "prisma/prisma.module";
import { Injectable, UnauthorizedException } from "@nestjs/common";

export interface JwtPayLoad {
    sub: string;
    email: string;
    role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private prisma: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || "PKS_EDUCATION_SUPER_SECRET_KEY_2026",
        });
    }

    async validate(payload: JwtPayLoad) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub }
        });

        if (!user) {
            throw new UnauthorizedException("Token invalid");
        }

        return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
        };
    }
}