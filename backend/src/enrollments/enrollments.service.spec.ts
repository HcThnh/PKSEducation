import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { EnrollmentService } from './enrollments.service';
import { PrismaService } from 'prisma/prisma.module';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_USER_ID = 'user-abc-123';
const MOCK_COURSE_ID = 'course-xyz-456';

const mockCourse = {
  id: MOCK_COURSE_ID,
  title: 'Lập trình NestJS',
  category: 'Backend',
  instructor: 'GV Nguyễn Văn A',
  shortDescription: 'Khóa học NestJS cơ bản đến nâng cao',
  fullDescription: null,
  fee: 2500000,
  maxCapacity: 30,
  enrolledCount: 10,
  isHidden: false,
  isFull: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockEnrollmentResult = {
  id: 'enrollment-001',
  userId: MOCK_USER_ID,
  courseId: MOCK_COURSE_ID,
  status: 'CONFIRMED',
  enrolledAt: new Date(),
  course: {
    id: mockCourse.id,
    title: mockCourse.title,
    category: mockCourse.category,
    instructor: mockCourse.instructor,
    fee: mockCourse.fee,
  },
};

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('EnrollmentService', () => {
  let service: EnrollmentService;
  let prisma: PrismaService;

  /**
   * Builds a mock `$transaction` that executes the provided callback
   * with a fake `tx` object whose methods can be controlled per test.
   */
  const buildMockTx = (overrides: {
    courseFindUnique?: jest.Mock;
    enrollmentFindUnique?: jest.Mock;
    courseUpdateMany?: jest.Mock;
    enrollmentCreate?: jest.Mock;
  }) => {
    const tx = {
      course: {
        findUnique: overrides.courseFindUnique ?? jest.fn().mockResolvedValue(mockCourse),
        updateMany: overrides.courseUpdateMany ?? jest.fn().mockResolvedValue({ count: 1 }),
      },
      enrollment: {
        findUnique: overrides.enrollmentFindUnique ?? jest.fn().mockResolvedValue(null),
        create: overrides.enrollmentCreate ?? jest.fn().mockResolvedValue(mockEnrollmentResult),
      },
    };
    return tx;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(),
            enrollment: { findMany: jest.fn() },
            course: { findUnique: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<EnrollmentService>(EnrollmentService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => jest.clearAllMocks());

  // ── Test Case 1: Ghi danh thành công ────────────────────────────────────────
  describe('enroll()', () => {
    it('TC1 - Ghi danh thành công khi còn chỗ', async () => {
      // Arrange
      const tx = buildMockTx({});
      (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => cb(tx));

      // Act
      const result = await service.enroll(MOCK_USER_ID, { courseId: MOCK_COURSE_ID });

      // Assert
      expect(result).toEqual({
        message: 'Successfully enrolled in the course!',
        enrollment: mockEnrollmentResult,
      });

      // Verify race-condition guard: updateMany was called with the capacity check
      expect(tx.course.updateMany).toHaveBeenCalledWith({
        where: {
          id: MOCK_COURSE_ID,
          enrolledCount: { lt: mockCourse.maxCapacity },
        },
        data: { enrolledCount: { increment: 1 } },
      });

      // Verify enrollment record was created
      expect(tx.enrollment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { userId: MOCK_USER_ID, courseId: MOCK_COURSE_ID },
        }),
      );
    });

    // ── Test Case 2: Ghi danh trùng lặp ─────────────────────────────────────
    it('TC2 - Ném ConflictException khi ghi danh trùng lặp', async () => {
      // Arrange: enrollment already exists
      const tx = buildMockTx({
        enrollmentFindUnique: jest.fn().mockResolvedValue({
          id: 'existing-enrollment',
          userId: MOCK_USER_ID,
          courseId: MOCK_COURSE_ID,
        }),
      });
      (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => cb(tx));

      // Act & Assert
      await expect(
        service.enroll(MOCK_USER_ID, { courseId: MOCK_COURSE_ID }),
      ).rejects.toThrow(ConflictException);

      await expect(
        service.enroll(MOCK_USER_ID, { courseId: MOCK_COURSE_ID }),
      ).rejects.toThrow('You already enrolled in this course.');

      // Verify: enrollment.create should NOT be called
      expect(tx.enrollment.create).not.toHaveBeenCalled();
    });

    // ── Test Case 3: Khóa học đầy ────────────────────────────────────────────
    it('TC3 - Ném BadRequestException khi khóa học đã đạt sĩ số tối đa', async () => {
      // Arrange: course is full (enrolledCount === maxCapacity), updateMany returns count=0
      const fullCourse = {
        ...mockCourse,
        enrolledCount: 30, // == maxCapacity
      };
      const tx = buildMockTx({
        courseFindUnique: jest.fn().mockResolvedValue(fullCourse),
        enrollmentFindUnique: jest.fn().mockResolvedValue(null), // not a duplicate
        courseUpdateMany: jest.fn().mockResolvedValue({ count: 0 }), // capacity lock prevents update
      });
      (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => cb(tx));

      // Act & Assert
      await expect(
        service.enroll(MOCK_USER_ID, { courseId: MOCK_COURSE_ID }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.enroll(MOCK_USER_ID, { courseId: MOCK_COURSE_ID }),
      ).rejects.toThrow('Course is already full!');

      // Verify: enrollment.create should NOT be called
      expect(tx.enrollment.create).not.toHaveBeenCalled();
    });

    // ── Bonus: Khóa học không tồn tại ────────────────────────────────────────
    it('TC4 - Ném NotFoundException khi khóa học không tồn tại', async () => {
      const tx = buildMockTx({
        courseFindUnique: jest.fn().mockResolvedValue(null),
      });
      (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => cb(tx));

      await expect(
        service.enroll(MOCK_USER_ID, { courseId: 'non-existent-id' }),
      ).rejects.toThrow(NotFoundException);
    });

    // ── Bonus: Khóa học bị ẩn ────────────────────────────────────────────────
    it('TC5 - Ném BadRequestException khi khóa học đang bị ẩn (isHidden = true)', async () => {
      const hiddenCourse = { ...mockCourse, isHidden: true };
      const tx = buildMockTx({
        courseFindUnique: jest.fn().mockResolvedValue(hiddenCourse),
      });
      (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => cb(tx));

      await expect(
        service.enroll(MOCK_USER_ID, { courseId: MOCK_COURSE_ID }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.enroll(MOCK_USER_ID, { courseId: MOCK_COURSE_ID }),
      ).rejects.toThrow('You cannot enroll in a hidden course.');
    });
  });
});
