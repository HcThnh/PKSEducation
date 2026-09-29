import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { courseApi } from '../api/courseApi';
import type { Course } from '../types/course';
import { useAuth } from '../context/AuthContext';
import { CourseCard } from '../components/CourseCard';

export const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [relatedCourses, setRelatedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingRelated, setLoadingRelated] = useState<boolean>(false);
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

        // Fetch related courses in the same category
        if (data.category) {
          fetchRelatedCourses(data.category, data.id);
        }
      } catch (err: any) {
        console.error('Lỗi khi lấy chi tiết khóa học:', err);
        setError('Không thể tải thông tin khóa học hoặc khóa học không tồn tại.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [id]);

  const fetchRelatedCourses = async (categoryName: string, currentCourseId: string) => {
    try {
      setLoadingRelated(true);
      const list = await courseApi.getCourses({ category: categoryName });
      // Exclude current course from related list
      const filtered = list.filter((item) => item.id !== currentCourseId);
      setRelatedCourses(filtered);
    } catch (err) {
      console.error('Lỗi tải khóa học liên quan:', err);
    } finally {
      setLoadingRelated(false);
    }
  };

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
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <Link to="/" style={{ display: 'inline-block', marginBottom: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>
        &larr; Quay lại danh sách khóa học
      </Link>

      <div className="course-detail-container">
        <div className="detail-header">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
            {/* Clickable category badge to filter courses by category */}
            <Link
              to={`/?category=${encodeURIComponent(course.category)}`}
              className="badge badge-category"
              title={`Xem tất cả khóa học thuộc danh mục ${course.category}`}
              style={{ cursor: 'pointer', textDecoration: 'none' }}
            >
              🏷️ {course.category}
            </Link>

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

      {/* Section: Courses in the same category */}
      <div style={{ marginTop: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
            Khóa học cùng danh mục ({course.category})
          </h3>

          <Link
            to={`/?category=${encodeURIComponent(course.category)}`}
            style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }}
          >
            Xem tất cả &rarr;
          </Link>
        </div>

        {loadingRelated ? (
          <div className="course-grid">
            {[1, 2].map((i) => (
              <div key={i} className="skeleton skeleton-card" />
            ))}
          </div>
        ) : relatedCourses.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px' }}>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Hiện chưa có khóa học khác cùng danh mục này.
            </p>
          </div>
        ) : (
          <div className="course-grid">
            {relatedCourses.map((item) => (
              <CourseCard key={item.id} course={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
