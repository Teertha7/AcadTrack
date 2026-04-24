# AcadTrack — Complete Setup Guide

## Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm

---

## 1. Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Run the schema
mysql -u root -p < database/schema.sql
```

This creates the `acad_track` database with 13 tables and seeds:
- Default admin: `admin@acadtrack.edu` / `Admin@1234`
- 5 sample departments

---

## 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MySQL credentials:
#   DB_PASSWORD=your_mysql_password

# Start development server
npm run dev
```

Backend runs at: **http://localhost:5000**

---

## 3. Frontend Setup

```bash
cd frontend

# Install dependencies (already done if you cloned)
npm install

# Start dev server
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 4. Project Structure

```
Acad_Track/
├── database/
│   └── schema.sql              # Full MySQL schema (13 tables)
├── backend/
│   ├── src/
│   │   ├── config/             # DB connection, JWT config
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # Auth, error handler, validation
│   │   ├── repositories/       # All DB queries
│   │   ├── routes/             # Express routers (/api/v1/*)
│   │   ├── services/           # Business logic
│   │   ├── utils/              # Logger, JWT helpers, AppError
│   │   ├── validations/        # Joi schemas
│   │   ├── app.js              # Express app
│   │   └── server.js           # Entry point
│   ├── .env                    # Environment config
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/                # Axios + endpoint functions
    │   ├── contexts/           # AuthContext
    │   ├── layouts/            # Admin/Faculty/Student layouts
    │   ├── pages/
    │   │   ├── admin/          # Dashboard, Students, Faculty, Courses, Enrollments, Fees
    │   │   ├── faculty/        # Dashboard, Courses, Attendance, Grades
    │   │   └── student/        # Dashboard, Grades, Attendance, Fees
    │   ├── App.jsx             # Router + protected routes
    │   └── main.jsx
    └── package.json
```

---

## 5. API Reference

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | Login (body: `{email, password, role}`) |
| POST | `/refresh` | Refresh access token |
| POST | `/logout` | Revoke refresh token |
| GET | `/me` | Get current user info |

### Students (`/api/v1/students`) — Admin/Faculty
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/?page&limit&search&department_id` | Admin, Faculty |
| GET | `/:id` | Admin, Faculty |
| POST | `/` | Admin only |
| PUT | `/:id` | Admin only |
| DELETE | `/:id` | Admin only |

### Faculty (`/api/v1/faculty`) — Admin only
| Method | Endpoint |
|--------|----------|
| GET | `/?page&limit&search&department_id` |
| POST | `/` |
| PUT | `/:id` |
| DELETE | `/:id` |

### Courses (`/api/v1/courses`) — All roles
| Method | Endpoint |
|--------|----------|
| GET | `/?page&limit&search&department_id&semester&faculty_id` |
| POST | `/` (Admin) |
| PUT | `/:id` (Admin) |

### Enrollments (`/api/v1/enrollments`)
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/` | Admin, Faculty |
| POST | `/` | Admin |
| PUT | `/:id/status` | Admin |
| GET | `/my` | Student |

### Attendance (`/api/v1/attendance`)
| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/bulk` | Faculty, Admin |
| GET | `/course/:courseId?date=` | Faculty, Admin |
| GET | `/my` | Student |
| GET | `/my/summary` | Student |

### Grades (`/api/v1/grades`)
| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/` | Faculty, Admin |
| GET | `/course/:courseId` | Faculty, Admin |
| GET | `/my` | Student |

### Fees (`/api/v1/fees`)
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/` | Admin |
| POST | `/` | Admin |
| GET | `/my` | Student |
| GET | `/payments` | Admin |
| POST | `/payments` | Admin |

### Admin Analytics (`/api/v1/analytics`) — Admin only
Returns: student, faculty, course, enrollment totals + revenue + dept breakdown

---

## 6. Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@acadtrack.edu | Admin@1234 |

To create Faculty/Student accounts, log in as Admin and use the Students/Faculty pages.

---

## 7. Security Features
- JWT access tokens (15 min) + refresh token rotation (7 days)
- bcrypt password hashing (12 rounds)
- Helmet secure headers
- CORS configured for localhost:5173
- Rate limiting: 100 req/15min per IP
- Input validation with Joi on all endpoints
- SQL injection protection via parameterized queries
- Soft deletes (students/faculty are never hard-deleted)
