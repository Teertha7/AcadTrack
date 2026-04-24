import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import LoginPage from './pages/LoginPage';
import AdminLayout from './layouts/AdminLayout';
import FacultyLayout from './layouts/FacultyLayout';
import StudentLayout from './layouts/StudentLayout';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminFaculty from './pages/admin/Faculty';
import AdminCourses from './pages/admin/Courses';
import AdminEnrollments from './pages/admin/Enrollments';
import AdminFees from './pages/admin/Fees';
import AdminReports from './pages/admin/Reports';

// Faculty Pages
import FacultyDashboard from './pages/faculty/Dashboard';
import FacultyCourses from './pages/faculty/Courses';
import FacultyAttendance from './pages/faculty/Attendance';
import FacultyGrades from './pages/faculty/Grades';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentGrades from './pages/student/Grades';
import StudentAttendance from './pages/student/Attendance';
import StudentFees from './pages/student/Fees';
import StudentCourseMaterials from './pages/student/CourseMaterials';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e2436',
              color: '#e8eaf6',
              border: '1px solid #2a3147',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#1e2436' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#1e2436' } },
          }}
        />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="faculty" element={<AdminFaculty />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="enrollments" element={<AdminEnrollments />} />
            <Route path="fees" element={<AdminFees />} />
            <Route path="reports" element={<AdminReports />} />
          </Route>

          {/* Faculty Routes */}
          <Route path="/faculty" element={
            <ProtectedRoute allowedRoles={['faculty']}>
              <FacultyLayout />
            </ProtectedRoute>
          }>
            <Route index element={<FacultyDashboard />} />
            <Route path="courses" element={<FacultyCourses />} />
            <Route path="attendance" element={<FacultyAttendance />} />
            <Route path="grades" element={<FacultyGrades />} />
          </Route>

          {/* Student Routes */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout />
            </ProtectedRoute>
          }>
            <Route index element={<StudentDashboard />} />
            <Route path="grades" element={<StudentGrades />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="fees" element={<StudentFees />} />
            <Route path="materials" element={<StudentCourseMaterials />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
