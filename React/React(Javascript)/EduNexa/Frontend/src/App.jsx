
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import StudentDetails from "./pages/StudentDetails";
import Teachers from "./pages/Teachers";
import TeacherDetails from "./pages/TeacherDetails";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import Enrollments from "./pages/Enrollments";
import Attendance from "./pages/Attendance";
import Grades from "./pages/Grades";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./components/layout/ProtectedRoute";

export default function App() {
    return (
        <Routes>

            {/* Login */}
            <Route
                path="/login"
                element={<Login />}
            />

            {/* Dashboard */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/dashboard"
                element={<Navigate to="/" replace />}
            />

            {/* Students: Admin and Teacher */}
            <Route
                path="/students"
                element={
                    <ProtectedRoute>
                        <Students />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/students/:studentId"
                element={
                    <ProtectedRoute>
                        <StudentDetails />
                    </ProtectedRoute>
                }
            />

            {/* Teachers: Admin only */}
            <Route
                path="/teachers"
                element={
                    <ProtectedRoute allowedRoles={["Admin"]}>
                        <Teachers />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/teachers/:teacherId"
                element={
                    <ProtectedRoute allowedRoles={["Admin"]}>
                        <TeacherDetails />
                    </ProtectedRoute>
                }
            />

            {/* Courses: Admin and Teacher */}
            <Route
                path="/courses"
                element={
                    <ProtectedRoute>
                        <Courses />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/courses/:courseId"
                element={
                    <ProtectedRoute>
                        <CourseDetails />
                    </ProtectedRoute>
                }
            />

            {/* Enrollments: Admin and Teacher */}
            <Route
                path="/enrollments"
                element={
                    <ProtectedRoute>
                        <Enrollments />
                    </ProtectedRoute>
                }
            />

            {/* Attendance: Admin and Teacher */}
            <Route
                path="/attendance"
                element={
                    <ProtectedRoute>
                        <Attendance />
                    </ProtectedRoute>
                }
            />

            {/* Grades: Admin and Teacher */}
            <Route
                path="/grades"
                element={
                    <ProtectedRoute>
                        <Grades />
                    </ProtectedRoute>
                }
            />

            {/* Reports: Admin only */}
            <Route
                path="/reports"
                element={
                    <ProtectedRoute allowedRoles={["Admin"]}>
                        <Reports />
                    </ProtectedRoute>
                }
            />

            {/* Profile: Admin and Teacher */}
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                }
            />

            {/* Not Found */}
            <Route
                path="*"
                element={<NotFound />}
            />

        </Routes>
    );
}
