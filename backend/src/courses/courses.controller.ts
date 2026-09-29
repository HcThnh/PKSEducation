import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { CoursesService } from "./courses.service";
import { GetCourseQueryDto } from "./dto/get-courses-query.dto";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { CreateCourseDto } from "./dto/create-course.dto";
import { Role } from "@prisma/client";
import { UpdateCourseDto } from "./dto/update-course.dto";

@Controller("courses")
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) {}

    @Get()
    async findAll(@Query() query: GetCourseQueryDto, @Request() req: any) {
        const userRole = req.user?.role;

        return this.coursesService.findAll(query, userRole);
    } 

    @Get(":id")
    async findOne(@Param("id") id: string) {
        return this.coursesService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async create(@Body() createCourseDto: CreateCourseDto) {
        return this.coursesService.create(createCourseDto);
    }

    @Patch(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async update(@Param("id") id: string, @Body() updateCourseDto: UpdateCourseDto) {
        return this.coursesService.update(id, updateCourseDto);
    }

    @Delete(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async remove(@Param("id") id: string) {
        return this.coursesService.remove(id);
    }
}