export interface Course {
  id: string;
  title: string;
  category: string;
  instructor: string;
  shortDescription: string;
  fullDescription?: string | null;
  fee: number;
  maxCapacity: number;
  enrolledCount: number;
  isHidden?: boolean;
  isFull?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  status: 'CONFIRMED' | 'CANCELLED';
  course?: Course;
}
