import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          PKS Education
        </Link>

        <button
          className="navbar-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <nav className={`navbar-nav ${isOpen ? 'mobile-open' : ''}`}>
          <Link to="/" className="nav-link" onClick={closeMenu}>
            Tất cả Khóa học
          </Link>

          {isAuthenticated && (
            <Link to="/my-courses" className="nav-link" onClick={closeMenu}>
              Khóa học của tôi
            </Link>
          )}

          {isAuthenticated && isAdmin && (
            <>
              <Link to="/admin/courses" className="nav-link" style={{ fontWeight: 600 }} onClick={closeMenu}>
                Quản lý Khóa học
              </Link>
              <Link to="/admin/enrollments" className="nav-link" style={{ fontWeight: 600 }} onClick={closeMenu}>
                Quản lý Học viên
              </Link>
            </>
          )}

          <div className="nav-user-actions">
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span className="user-badge">
                  {user?.fullName} ({user?.role})
                </span>
                <button onClick={handleLogout} className="btn btn-outline btn-sm">
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link to="/login" className="btn btn-outline btn-sm" onClick={closeMenu}>
                  Đăng nhập
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" onClick={closeMenu}>
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};
