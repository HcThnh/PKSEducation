import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { courseApi, type CourseEnrollmentsResponse } from '../../api/courseApi';
import type { Course } from '../../types/course';

export const AdminEnrollmentsPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [enrollmentData, setEnrollmentData] = useState<CourseEnrollmentsResponse | null>(null);
  const [loadingCourses, setLoadingCourses] = useState<boolean>(true);
  const [loadingEnrollments, setLoadingEnrollments] = useState<boolean>(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        const data = await courseApi.getCourses();
        setCourses(data);
        if (data.length > 0) {
          setSelectedCourseId(data[0].id);
        }
      } catch (err: any) {
        console.error('Lỗi lấy danh sách khóa học:', err);
        toast.error('Không thể tải danh sách khóa học.');
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourseId) {
      setEnrollmentData(null);
      return;
    }

    const fetchCourseEnrollments = async () => {
      try {
        setLoadingEnrollments(true);
        const data = await courseApi.getCourseEnrollments(selectedCourseId);
        setEnrollmentData(data);
      } catch (err: any) {
        console.error('Lỗi lấy danh sách học viên ghi danh:', err);
        toast.error('Không thể tải danh sách học viên của khóa học này.');
      } finally {
        setLoadingEnrollments(false);
      }
    };

    fetchCourseEnrollments();
  }, [selectedCourseId]);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
          Quản Lý Học Viên Ghi Danh
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Xem danh sách học viên đã đăng ký cho từng khóa học cụ thể.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
          Chọn khóa học để xem danh sách học viên:
        </label>
        {loadingCourses ? (
          <div className="skeleton" style={{ height: '38px', width: '100%' }} />
        ) : (
          <select
            className="form-control"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title} — ({course.enrolledCount}/{course.maxCapacity} học viên)
              </option>
            ))}
          </select>
        )}
      </div>

      {loadingEnrollments ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: '56px' }} />
          ))}
        </div>
      ) : !enrollmentData ? (
        <div className="empty-state">
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Vui lòng chọn khóa học để xem dữ liệu.</p>
        </div>
      ) : (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius)',
              marginBottom: '16px',
            }}
          >
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                {enrollmentData.courseTitle}
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px', margin: 0 }}>
                Sĩ số khóa học
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className="badge badge-category" style={{ fontSize: '14px', padding: '4px 12px' }}>
                {enrollmentData.enrolledCount} / {enrollmentData.maxCapacity} Học viên
              </span>
            </div>
          </div>

          {enrollmentData.students.length === 0 ? (
            <div className="empty-state">
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                Chưa có học viên nào ghi danh khóa học này
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Danh sách sẽ tự động cập nhật khi có học viên đăng ký.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>STT</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Họ và Tên</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Email</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Ngày Ghi Danh</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Trạng Thái</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollmentData.students.map((student, index) => (
                    <tr key={student.enrollmentId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {index + 1}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-main)' }}>
                        {student.fullName}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                        {student.email}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                        {student.enrolledAt}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className="badge badge-available">CONFIRMED</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
