import { Body, Controller, Get, Param, Post, Request, UseGuards, UnauthorizedException } from "@nestjs/common";
import { EnrollmentService } from "./enrollments.service";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { CreateEnrollmentDto } from "./dto/create-enrollment.dto";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Controller("enrollments")
@UseGuards(JwtAuthGuard)
export class EnrollmentsController {
    constructor(private readonly enrollmentsService: EnrollmentService) {}

    @Post()
    async enroll(@Request() req: any, @Body() dto: CreateEnrollmentDto) {
        if (!req?.user) {
            throw new UnauthorizedException("Vui lòng đăng nhập lại.");
        }
        return this.enrollmentsService.enroll(req.user.id, dto);
    }

    @Get("my-courses")
    async getMyCourses(@Request() req: any) {
        if (!req?.user) {
            throw new UnauthorizedException("Vui lòng đăng nhập lại.");
        }
        return this.enrollmentsService.getMyCourse(req.user.id);
    }

    @Get("course/:courseId")
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN, Role.STAFF)
    async getCourseEnrollments(@Param("courseId") courseId: string) {
        return this.enrollmentsService.getCourseEnrollments(courseId);
    }
}