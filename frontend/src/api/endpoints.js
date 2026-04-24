import api from './axios';

export const authAPI = {
  login: (email, password, role) => api.post('/auth/login', { email, password, role }),
  logout: (refreshToken, role) => api.post('/auth/logout', { refreshToken, role }),
  me: () => api.get('/auth/me'),
};

export const studentsAPI = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
};

export const facultyAPI = {
  getAll: (params) => api.get('/faculty', { params }),
  getById: (id) => api.get(`/faculty/${id}`),
  create: (data) => api.post('/faculty', data),
  update: (id, data) => api.put(`/faculty/${id}`, data),
  delete: (id) => api.delete(`/faculty/${id}`),
};

export const coursesAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
};

export const enrollmentsAPI = {
  getAll: (params) => api.get('/enrollments', { params }),
  enroll: (student_id, course_id) => api.post('/enrollments', { student_id, course_id }),
  updateStatus: (id, status) => api.put(`/enrollments/${id}/status`, { status }),
  getMyEnrollments: () => api.get('/enrollments/my'),
};

export const attendanceAPI = {
  markBulk: (data) => api.post('/attendance/bulk', data),
  getByCourse: (courseId, date) => api.get(`/attendance/course/${courseId}`, { params: { date } }),
  getStudentSummary: (studentId) => api.get(`/attendance/student/${studentId}/summary`),
  getMy: (params) => api.get('/attendance/my', { params }),
  getMySummary: () => api.get('/attendance/my/summary'),
};

export const gradesAPI = {
  getByCourse: (courseId) => api.get(`/grades/course/${courseId}`),
  getStudentGrades: (studentId) => api.get(`/grades/student/${studentId}`),
  getMy: () => api.get('/grades/my'),
  upsert: (data) => api.post('/grades', data),
};

export const feesAPI = {
  getAll: (params) => api.get('/fees', { params }),
  getMy: () => api.get('/fees/my'),
  create: (data) => api.post('/fees', data),
  update: (id, data) => api.put(`/fees/${id}`, data),
  getPayments: (params) => api.get('/fees/payments', { params }),
  recordPayment: (data) => api.post('/fees/payments', data),
};

export const adminAPI = {
  getDepartments: () => api.get('/departments'),
  createDepartment: (data) => api.post('/departments', data),
  updateDepartment: (id, data) => api.put(`/departments/${id}`, data),
  deleteDepartment: (id) => api.delete(`/departments/${id}`),
  getStats: () => api.get('/analytics'),
};

export const reportsAPI = {
  getDepartmentAcademic: () => api.get('/reports/department-academic'),
  getCourseGrade: (courseId) => api.get(`/reports/course-grade/${courseId}`),
};

export const courseMaterialsAPI = {
  getMaterials: (courseId) => api.get(`/courses/${courseId}/materials`),
  upload: (courseId, formData) =>
    api.post(`/courses/${courseId}/materials`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  remove: (courseId, materialId) =>
    api.delete(`/courses/${courseId}/materials/${materialId}`),
};
