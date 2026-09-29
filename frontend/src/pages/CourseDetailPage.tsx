import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { courseApi } from '../api/courseApi';
import type { Course } from '../types/course';
import { useAuth } from '../context/AuthContext';

export const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await courseApi.getCourseById(id);
        setCourse(data);
      } catch (err: any) {
        console.error('Lỗi khi lấy chi tiết khóa học:', err);
        setError('Không thể tải thông tin khóa học hoặc khóa học không tồn tại.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [id]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!id || !course) return;

    try {
      setSubmitting(true);
      await courseApi.enrollCourse(id);
      
      toast.success('Ghi danh thành công!');

      setCourse((prev) =>
        prev
          ? {
              ...prev,
              enrolledCount: prev.enrolledCount + 1,
            }
          : null
      );
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Ghi danh thất bại. Vui lòng thử lại!';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="skeleton skeleton-card" style={{ height: '350px' }} />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="empty-state">
        <h3 style={{ fontSize: '18px', color: 'var(--text-main)', marginBottom: '8px' }}>Lỗi Tải Dữ Liệu</h3>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>{error}</p>
        <Link to="/" className="btn btn-outline btn-sm">
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const isFull = course.isFull === true || course.enrolledCount >= course.maxCapacity;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/" style={{ display: 'inline-block', marginBottom: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>
        &larr; Quay lại danh sách khóa học
      </Link>

      <div className="course-detail-container">
        <div className="detail-header">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
            <span className="badge badge-category">{course.category}</span>
            {isFull ? (
              <span className="badge badge-full">Hết chỗ</span>
            ) : (
              <span className="badge badge-available">Còn chỗ</span>
            )}
          </div>

          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
            {course.title}
          </h1>

          <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>{course.shortDescription}</p>
        </div>

        <div className="detail-meta-grid">
          <div className="meta-item">
            <span className="meta-label">Giảng viên</span>
            <span className="meta-value">{course.instructor}</span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Sĩ số</span>
            <span className="meta-value" style={{ color: isFull ? 'var(--badge-red-text)' : 'var(--text-main)' }}>
              {course.enrolledCount} / {course.maxCapacity}
            </span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Học phí</span>
            <span className="meta-value">{formatVND(course.fee)}</span>
          </div>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '12px' }}>
            Mô tả chi tiết bài học
          </h2>
          <div
            style={{
              fontSize: '15px',
              lineHeight: '1.7',
              color: '#374151',
              whiteSpace: 'pre-line',
              backgroundColor: '#fafafa',
              padding: '16px',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius)',
            }}
          >
            {course.fullDescription || 'Chưa có thông tin mô tả chi tiết bài học cho khóa học này.'}
          </div>
        </div>

        <div>
          <button
            onClick={handleEnroll}
            disabled={isFull || submitting}
            className="btn btn-primary btn-block"
            style={{ padding: '12px', fontSize: '15px', fontWeight: 600 }}
          >
            {submitting ? (
              <>
                <span className="spinner" />
                <span>Đang xử lý ghi danh...</span>
              </>
            ) : isFull ? (
              'Khóa học đã hết chỗ'
            ) : (
              'Ghi danh khóa học'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
