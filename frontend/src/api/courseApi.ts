import axiosClient from './axiosClient';
import type { Course, Enrollment } from '../types/course';

export interface GetCoursesParams {
  search?: string;
  category?: string;
}

export interface CreateCoursePayload {
  title: string;
  category: string;
  instructor: string;
  shortDescription: string;
  fullDescription?: string;
  fee: number;
  maxCapacity: number;
}

export interface UpdateCoursePayload extends Partial<CreateCoursePayload> {
  isHidden?: boolean;
}

export interface CourseStudentEnrollment {
  enrollmentId: string;
  studentId: string;
  fullName: string;
  email: string;
  status: string;
  enrolledAt: string;
}

export interface CourseEnrollmentsResponse {
  courseId: string;
  courseTitle: string;
  maxCapacity: number;
  enrolledCount: number;
  students: CourseStudentEnrollment[];
}

export const courseApi = {
  getCourses: async (params?: GetCoursesParams): Promise<Course[]> => {
    const response = await axiosClient.get('/courses', { params });
    return response as unknown as Course[];
  },

  getCourseById: async (id: string): Promise<Course> => {
    const response = await axiosClient.get(`/courses/${id}`);
    return response as unknown as Course;
  },

  enrollCourse: async (courseId: string): Promise<Enrollment> => {
    const response = await axiosClient.post('/enrollments', { courseId });
    return response as unknown as Enrollment;
  },

  getMyCourses: async (): Promise<Enrollment[]> => {
    const response = await axiosClient.get('/enrollments/my-courses');
    return response as unknown as Enrollment[];
  },

  // Admin APIs
  createCourse: async (payload: CreateCoursePayload): Promise<Course> => {
    const response = await axiosClient.post('/courses', payload);
    return response as unknown as Course;
  },

  updateCourse: async (id: string, payload: UpdateCoursePayload): Promise<Course> => {
    const response = await axiosClient.patch(`/courses/${id}`, payload);
    return response as unknown as Course;
  },

  deleteCourse: async (id: string): Promise<void> => {
    await axiosClient.delete(`/courses/${id}`);
  },

  getCourseEnrollments: async (courseId: string): Promise<CourseEnrollmentsResponse> => {
    const response = await axiosClient.get(`/enrollments/course/${courseId}`);
    return response as unknown as CourseEnrollmentsResponse;
  },
};
