import { Module } from "@nestjs/common";
import { EnrollmentsController } from "./enrollments.controller";
import { EnrollmentService } from "./enrollments.service";

@Module({
    controllers: [EnrollmentsController],
    providers: [EnrollmentService],
    exports: [EnrollmentService],
})
export class EnrollmentsModule {}