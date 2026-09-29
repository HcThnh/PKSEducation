import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { courseApi, type CreateCoursePayload } from '../../api/courseApi';
import type { Course } from '../../types/course';

export const AdminCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [instructor, setInstructor] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [fee, setFee] = useState<number>(0);
  const [maxCapacity, setMaxCapacity] = useState<number>(10);

  const fetchAllCourses = async () => {
    try {
      setLoading(true);
      const data = await courseApi.getCourses();
      setCourses(data);
    } catch (err: any) {
      console.error('Lỗi lấy danh sách khóa học Admin:', err);
      toast.error('Không thể tải danh sách khóa học.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCourses();
  }, []);

  const openCreateModal = () => {
    setEditingCourse(null);
    setTitle('');
    setCategory('');
    setInstructor('');
    setShortDescription('');
    setFullDescription('');
    setFee(0);
    setMaxCapacity(10);
    setIsModalOpen(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setTitle(course.title);
    setCategory(course.category);
    setInstructor(course.instructor);
    setShortDescription(course.shortDescription);
    setFullDescription(course.fullDescription || '');
    setFee(course.fee);
    setMaxCapacity(course.maxCapacity);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !category.trim() || !instructor.trim() || !shortDescription.trim()) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    if (fee < 0) {
      toast.error('Học phí không thể nhỏ hơn 0');
      return;
    }

    if (editingCourse && maxCapacity < editingCourse.enrolledCount) {
      toast.error(
        `Sĩ số tối đa (${maxCapacity}) không được nhỏ hơn số lượng học viên đã đăng ký (${editingCourse.enrolledCount})!`
      );
      return;
    }

    const payload: CreateCoursePayload = {
      title: title.trim(),
      category: category.trim(),
      instructor: instructor.trim(),
      shortDescription: shortDescription.trim(),
      fullDescription: fullDescription.trim(),
      fee: Number(fee),
      maxCapacity: Number(maxCapacity),
    };

    try {
      setSubmitting(true);
      if (editingCourse) {
        await courseApi.updateCourse(editingCourse.id, payload);
        toast.success('Cập nhật khóa học thành công!');
      } else {
        await courseApi.createCourse(payload);
        toast.success('Thêm khóa học mới thành công!');
      }

      closeModal();
      fetchAllCourses();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin khóa học.';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleHide = async (course: Course) => {
    try {
      const newHiddenState = !course.isHidden;
      await courseApi.updateCourse(course.id, { isHidden: newHiddenState });
      toast.success(newHiddenState ? 'Đã ẩn khóa học' : 'Đã hiển thị khóa học');
      fetchAllCourses();
    } catch (err: any) {
      toast.error('Không thể thay đổi trạng thái ẩn/hiện.');
    }
  };

  const handleDeleteCourse = async (course: Course) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa khóa học "${course.title}" không?`)) {
      return;
    }

    try {
      await courseApi.deleteCourse(course.id);
      toast.success('Đã xóa khóa học thành công!');
      fetchAllCourses();
    } catch (err: any) {
      toast.error('Không thể xóa khóa học này.');
    }
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
            Quản Lý Khóa Học
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Quản lý, thêm mới, chỉnh sửa và ẩn/hiện danh sách khóa học.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary">
          + Thêm khóa học mới
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: '64px' }} />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
            Chưa có khóa học nào
          </p>
          <button onClick={openCreateModal} className="btn btn-primary btn-sm">
            Thêm khóa học ngay
          </button>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Tên Khóa Học</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Danh Mục</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Giảng Viên</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Sĩ Số (Đã ĐK / Max)</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Học Phí</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Trạng Thái</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => {
                return (
                  <tr key={course.id} style={{ borderBottom: '1px solid var(--border-color)', opacity: course.isHidden ? 0.75 : 1 }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {course.title}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="badge badge-category">{course.category}</span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                      {course.instructor}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                      {course.enrolledCount} / {course.maxCapacity}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                      {formatVND(course.fee)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {course.isHidden ? (
                        <span className="badge badge-hidden">Đang Ẩn</span>
                      ) : (
                        <span className="badge badge-available">Đang Hiển Thị</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button onClick={() => openEditModal(course)} className="btn btn-outline btn-sm">
                          Sửa
                        </button>
                        <button onClick={() => handleToggleHide(course)} className="btn btn-outline btn-sm">
                          {course.isHidden ? 'Hiện' : 'Ẩn'}
                        </button>
                        <button onClick={() => handleDeleteCourse(course)} className="btn btn-danger btn-sm">
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingCourse ? 'Chỉnh Sửa Khóa Học' : 'Thêm Khóa Học Mới'}
              </h3>
              <button className="modal-close" onClick={closeModal}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                  Tên khóa học <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nhập tên khóa học..."
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                    Danh mục <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="VD: Lập trình, Ngoại ngữ..."
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                    Giảng viên <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    placeholder="Tên giảng viên..."
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                  Mô tả ngắn <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Tóm tắt ngắn gọn khóa học..."
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                  Mô tả chi tiết bài học
                </label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  placeholder="Nội dung khóa học, đề cương bài học..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                    Học phí (VND) <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={fee}
                    onChange={(e) => setFee(Number(e.target.value))}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                    Sĩ số tối đa <span style={{ color: 'red' }}>*</span>
                    {editingCourse && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: 400 }}>
                        (Số lượng đã ĐK: {editingCourse.enrolledCount})
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    min={editingCourse ? editingCourse.enrolledCount : 1}
                    className="form-control"
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={closeModal} className="btn btn-outline">
                  Hủy
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? <span className="spinner" /> : editingCourse ? 'Cập Nhật' : 'Tạo Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
