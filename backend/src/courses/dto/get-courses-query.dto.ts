import { IsOptional, IsString } from "class-validator";

export class GetCourseQueryDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    category?: string;
}