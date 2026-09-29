import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.module";
import { GetCourseQueryDto } from "./dto/get-courses-query.dto";
import { Role } from "@prisma/client";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";

@Injectable()
export class CoursesService {
    constructor(private prisma: PrismaService) {}

    async findAll(query: GetCourseQueryDto, userRole?: Role) {
        const { search, category } = query;

        const where: any = {};

        if (userRole !== Role.ADMIN && userRole !== Role.STAFF) {
            where.isHidden = false;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { shortDescription: { contains: search, mode: "insensitive" } },
                { instructor: { contains: search, mode: "insensitive" } },
            ];
        }

        if (category) {
            where.category = {
                equals: category,
                mode: "insensitive",
            };
        }

        const courses = await this.prisma.course.findMany({
            where,
            orderBy: { createdAt: "desc" }
        });

        return courses.map(course => ({
            ...course,
            isFull: course.enrolledCount >= course.maxCapacity,
        }));
    }

    async findOne(id: string) {
        const course = await this.prisma.course.findUnique({
            where: { id },
        })

        if (!course) {
            throw new NotFoundException("Course is not found");
        }

        return {
            ...course,
            isFull: course.enrolledCount >= course.maxCapacity,
        };
    }

    async create(dto: CreateCourseDto) {
        return this.prisma.course.create({
            data: {
                ...dto,
                enrolledCount: 0,
                isHidden: false,
            }
        })
    }

    async update(id: string, dto: UpdateCourseDto) {
        const existingCourse = await this.prisma.course.findUnique({
            where: { id },
        });

        if (!existingCourse) {
            throw new NotFoundException("Course is not found");
        }

        if (dto.maxCapacity !== undefined && dto.maxCapacity < existingCourse.enrolledCount) {
            throw new BadRequestException("Max capacity must be greater than or equal to enrolled count")
        }

        return this.prisma.course.update({
            where: { id },
            data: dto,
        })
    }

    async remove(id: string) {
        const existingCourse = await this.prisma.course.findUnique({
            where: { id },
        });

        if (!existingCourse) {
            throw new NotFoundException("Course is not found");
        }

        return this.prisma.course.delete({
            where: { id },
        });
    }
}