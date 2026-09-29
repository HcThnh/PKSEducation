import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoutes';
import { HomePage } from './pages/HomePage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { MyCoursesPage } from './pages/MyCoursesPage';
import { AdminCoursesPage } from './pages/admin/AdminCoursesPage';
import { AdminEnrollmentsPage } from './pages/admin/AdminEnrollmentsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <Toaster position="top-right" reverseOrder={false} />
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/course/:id" element={<CourseDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Student Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/my-courses" element={<MyCoursesPage />} />
              </Route>

              {/* Protected Admin/Staff Routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin/courses" element={<AdminCoursesPage />} />
                <Route path="/admin/enrollments" element={<AdminEnrollmentsPage />} />
              </Route>
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
