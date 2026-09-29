import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseApi } from '../api/courseApi';
import type { Enrollment } from '../types/course';

export const MyCoursesPage: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await courseApi.getMyCourses();
        setEnrollments(data);
      } catch (err: any) {
        console.error('Lỗi tải danh sách khóa học của tôi:', err);
        setError('Không thể lấy danh sách khóa học đã ghi danh.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, []);

  const formatVND = (amount?: number) => {
    if (amount === undefined || amount === null) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
          Khóa học của tôi
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Danh sách tất cả các khóa học bạn đã đăng ký tham gia.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: '72px' }} />
          ))}
        </div>
      ) : error ? (
        <div className="empty-state">
          <p style={{ fontSize: '15px', color: 'var(--badge-red-text)', marginBottom: '12px' }}>{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-outline btn-sm">
            Thử lại
          </button>
        </div>
      ) : enrollments.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
            Bạn chưa đăng ký khóa học nào
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Hãy tham khảo danh sách các khóa học hiện có và ghi danh ngay hôm nay!
          </p>
          <Link to="/" className="btn btn-primary btn-sm">
            Khám phá khóa học
          </Link>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-main)' }}>Tên Khóa Học</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-main)' }}>Danh Mục</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-main)' }}>Giảng Viên</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-main)' }}>Học Phí</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-main)' }}>Ngày Ghi Danh</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-main)' }}>Trạng Thái</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-main)', textAlign: 'right' }}>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((item) => {
                const course = item.course;
                const isConfirmed = item.status === 'CONFIRMED';
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-main)' }}>
                      <Link to={`/course/${course?.id}`} style={{ color: 'inherit' }}>
                        {course?.title || 'Khóa học không tồn tại'}
                      </Link>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="badge badge-category">{course?.category || '---'}</span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                      {course?.instructor || '---'}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                      {formatVND(course?.fee)}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                      {item.enrolledAt}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {isConfirmed ? (
                        <span className="badge badge-available">Đã xác nhận</span>
                      ) : (
                        <span className="badge badge-full">Đã hủy</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {course?.id && (
                        <Link to={`/course/${course.id}`} className="btn btn-outline btn-sm">
                          Xem chi tiết
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
