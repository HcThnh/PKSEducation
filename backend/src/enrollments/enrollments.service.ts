import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.module";
import { CreateEnrollmentDto } from "./dto/create-enrollment.dto";

@Injectable()
export class EnrollmentService {
    constructor(private prisma: PrismaService) {}

    async enroll(userId: string, dto: CreateEnrollmentDto) {
        const { courseId } = dto;

        return await this.prisma.$transaction(async (tx) => {
            const course = await tx.course.findUnique({
                where: { id: courseId }
            });

            if (!course) {
                throw new NotFoundException(`Course with id "${courseId}" is not found!`);
            }

            if (course.isHidden) {
                throw new BadRequestException("You cannot enroll in a hidden course.");
            }

            const existingEnrollment = await tx.enrollment.findUnique({
                where: {
                    user_course_unique: { userId, courseId }
                },
            });

            if (existingEnrollment) {
                throw new ConflictException("You already enrolled in this course.");
            };

            const updatedCourse = await tx.course.updateMany({
                where: {
                    id: courseId,
                    enrolledCount: { lt: course.maxCapacity },
                },
                data: {
                    enrolledCount: { increment: 1 },
                },
            });

            if (updatedCourse.count == 0) {
                throw new BadRequestException("Course is already full!");
            }

            const enrollment = await tx.enrollment.create({
                data: {
                    userId,
                    courseId,
                },
                include: {
                    course: {
                        select: {
                            id: true,
                            title: true,
                            category: true,
                            instructor: true,
                            fee: true,
                        },
                    },
                },
            });

            return {
                message: "Successfully enrolled in the course!",
                enrollment,
            };
        });
    }

    async getMyCourse(userId: string) {
        const enrollments = await this.prisma.enrollment.findMany({
            where: { userId },
            include: {
                course: true,
            },
            orderBy: { enrolledAt: "desc" }
        });

        return enrollments.map((item) => {
            const dateFormatted = new Intl.DateTimeFormat('en-CA', {
                timeZone: "Asia/Ho_Chi_Minh",
            }).format(item.enrolledAt);

            return {
                id: item.id,
                status: item.status,
                enrolledAt: dateFormatted,
                course: item.course,
            };
        });
    }

    async getCourseEnrollments(courseId: string) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
        });

        if (!course) {
            throw new NotFoundException(`Course with id "${courseId}" not found.`);
        }

        const enrollments = await this.prisma.enrollment.findMany({
            where: { courseId },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
            orderBy: {enrolledAt: "desc"},
        });

        return {
            courseId: course.id,
            courseTitle: course.title,
            maxCapacity: course.maxCapacity,
            enrolledCount: course.enrolledCount,
            students: enrollments.map((item) => {
                return {
                    enrollmentId: item.id,
                    studentId: item.user.id,
                    fullName: item.user.fullName,
                    email: item.user.email,
                    status: item.status,
                    enrolledAt: new Intl.DateTimeFormat('en-CA', {
                        timeZone: 'Asia/Ho_Chi_Minh',
                    }).format(item.enrolledAt),
                };
            }),
        }  
    }
}