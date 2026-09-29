import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosClient from '../api/axiosClient';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim() || !password) {
      toast.error('Vui lòng điền đầy đủ tất cả các trường');
      return;
    }

    try {
      setLoading(true);
      await axiosClient.post('/auth/register', {
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });

      toast.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err: any) {
      const status = err.response?.status;
      const rawMessage = err.response?.data?.message;

      if (status === 409 || (typeof rawMessage === 'string' && rawMessage.toLowerCase().includes('email'))) {
        toast.error('Email này đã được đăng ký. Vui lòng sử dụng email khác!');
      } else if (Array.isArray(rawMessage)) {
        toast.error(rawMessage.join(', '));
      } else {
        toast.error(rawMessage || 'Đăng ký không thành công. Vui lòng thử lại!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto' }}>
      <div className="card">
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', textAlign: 'center', color: 'var(--text-main)' }}>
          Đăng Ký Tài Khoản
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: 'var(--text-main)' }}>
              Họ và tên
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Nguyễn Văn A"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: 'var(--text-main)' }}>
              Email
            </label>
            <input
              type="email"
              className="form-control"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: 'var(--text-main)' }}>
              Mật khẩu
            </label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-block" style={{ marginTop: '8px' }}>
            {loading ? <span className="spinner" /> : 'Đăng Ký'}
          </button>
        </form>

        <p style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
          Đã có tài khoản?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
};
