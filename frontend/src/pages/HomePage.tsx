import React, { useState, useEffect } from 'react';
import { courseApi } from '../api/courseApi';
import type { Course } from '../types/course';
import { CourseCard } from '../components/CourseCard';

export const HomePage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params: { search?: string; category?: string } = {};
      if (search.trim()) params.search = search.trim();
      if (category) params.category = category;

      const data = await courseApi.getCourses(params);
      setCourses(data);

      if (data && data.length > 0) {
        const uniqueCategories = Array.from(new Set(data.map((c) => c.category).filter(Boolean)));
        setCategories((prev) => (prev.length === 0 ? uniqueCategories : prev));
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách khóa học:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchCourses();
    }, 300);

    return () => clearTimeout(handler);
  }, [search, category]);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
          Danh sách Khóa học
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Khám phá các khóa học chất lượng cao dành cho sinh viên.
        </p>
      </div>

      <div className="filter-bar">
        <div className="filter-search">
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm khóa học theo tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-category">
          <select
            className="form-control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="course-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton skeleton-card" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '4px' }}>
            Không tìm thấy khóa học nào phù hợp
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Vui lòng thử thay đổi từ khóa tìm kiếm hoặc bỏ lọc danh mục.
          </p>
        </div>
      ) : (
        <div className="course-grid">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};
