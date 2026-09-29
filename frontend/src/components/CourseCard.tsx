import React from 'react';
import { Link } from 'react-router-dom';
import type { Course } from '../types/course';

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const isFull = course.isFull === true || course.enrolledCount >= course.maxCapacity;

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div className="card" style={{ height: '100%' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span className="badge badge-category">{course.category}</span>
          {isFull ? (
            <span className="badge badge-full">Hết chỗ</span>
          ) : (
            <span className="badge badge-available">Còn chỗ</span>
          )}
        </div>

        <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
          <Link to={`/course/${course.id}`} style={{ color: 'inherit' }}>
            {course.title}
          </Link>
        </h3>

        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>
          Giảng viên: <strong style={{ color: 'var(--text-main)', fontWeight: 500 }}>{course.instructor}</strong>
        </p>

        <p style={{
          fontSize: '14px',
          color: 'var(--text-muted)',
          marginBottom: '16px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {course.shortDescription}
        </p>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Sĩ số
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: isFull ? 'var(--badge-red-text)' : 'var(--text-main)' }}>
              {course.enrolledCount} / {course.maxCapacity}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Học phí
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
              {formatVND(course.fee)}
            </div>
          </div>
        </div>

        <Link to={`/course/${course.id}`} className="btn btn-outline btn-block btn-sm">
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
};
