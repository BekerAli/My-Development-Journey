import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import MainLayout from "../components/layout/MainLayout";

import {
    courses,
    teachers,
    students,
    enrollments,
} from "../data/mockData";

import "../styles/CourseDetails.css";

// Safely load data from localStorage
function loadData(key, fallbackData) {
    try {
        const savedData = localStorage.getItem(key);

        if (!savedData) {
            return fallbackData;
        }

        const parsedData = JSON.parse(savedData);

        return Array.isArray(parsedData) ? parsedData : fallbackData;
    } catch {
        return fallbackData;
    }
}

// Format dates safely
function formatDate(date) {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Not available";
    }

    return parsedDate.toLocaleDateString();
}

export default function CourseDetails() {
    const { user } = useAuth();
    const { courseId } = useParams();
    const navigate = useNavigate();

    const isAdmin = user?.role === "Admin";
    const isTeacher = user?.role === "Teacher";

    // Load data
    const [courseList] = useState(() =>
        loadData("eduTrackCourses", courses)
    );

    const [teacherList] = useState(() =>
        loadData("eduTrackTeachers", teachers)
    );

    const [studentList] = useState(() =>
        loadData("eduTrackStudents", students)
    );

    const [enrollmentList] = useState(() =>
        loadData("eduTrackEnrollments", enrollments)
    );

    // Find the selected course
    const selectedCourse = courseList.find(
        (course) => String(course._id) === String(courseId)
    );

    // Check course access
    const hasCourseAccess =
        isAdmin ||
        (isTeacher &&
            selectedCourse?.teacherId === user?.teacherId);

    // Course not found
    if (!selectedCourse) {
        return (
            <MainLayout>
                <section className="courseDetailsPage">
                    <div className="courseDetailsMessage">
                        <div className="courseMessageIcon">!</div>

                        <h1>Course Not Found</h1>

                        <p>
                            The course you are looking for does not exist
                            or may have been removed.
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate("/courses")}
                        >
                            Back to Courses
                        </button>
                    </div>
                </section>
            </MainLayout>
        );
    }

    // Access restriction
    if (!hasCourseAccess) {
        return (
            <MainLayout>
                <section className="courseDetailsPage">
                    <div className="courseDetailsMessage">
                        <div className="courseMessageIcon denied">!</div>

                        <h1>Access Denied</h1>

                        <p>
                            You do not have permission to view this course.
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate("/courses")}
                        >
                            Back to My Courses
                        </button>
                    </div>
                </section>
            </MainLayout>
        );
    }

    // Find assigned teacher
    const assignedTeacher = teacherList.find(
        (teacher) =>
            String(teacher._id) === String(selectedCourse.teacherId)
    );

    // Find enrollments belonging to this course
    const courseEnrollments = enrollmentList.filter(
        (enrollment) =>
            String(enrollment.courseId) === String(selectedCourse._id)
    );

    // Find enrolled students
    const enrolledStudents = courseEnrollments
        .map((enrollment) => {
            const student = studentList.find(
                (item) =>
                    String(item._id) === String(enrollment.studentId)
            );

            if (!student) return null;

            return {
                ...student,
                enrollmentStatus: enrollment.status,
                enrollmentDate: enrollment.enrollmentDate,
            };
        })
        .filter(Boolean);

    // Enrollment statistics
    const activeEnrollments = enrolledStudents.filter(
        (student) => student.enrollmentStatus === "Active"
    ).length;

    const courseStatus = String(
        selectedCourse.status || "Unknown"
    ).toLowerCase();

    return (
        <MainLayout>
            <section className="courseDetailsPage">

                {/* Page Header */}
                <div className="courseDetailsPageHeader">
                    <div>
                        <span className="courseDetailsEyebrow">
                            COURSE MANAGEMENT
                        </span>

                        <h1>{selectedCourse.name}</h1>

                        <p>
                            Dashboard / Courses / {selectedCourse.name}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="courseBackButton"
                        onClick={() => navigate("/courses")}
                    >
                        <span>←</span> Back to Courses
                    </button>
                </div>

                {/* Course Overview */}
                <div className="courseDetailsOverview">

                    <div className="courseOverviewMain">
                        <div className="courseOverviewTop">
                            <div className="courseOverviewIcon">
                                📘
                            </div>

                            <span
                                className={`courseStatus ${courseStatus}`}
                            >
                                {selectedCourse.status || "Unknown"}
                            </span>
                        </div>

                        <h2>{selectedCourse.name}</h2>

                        <p className="courseOverviewCode">
                            Course Code: {selectedCourse.code || "N/A"}
                        </p>

                        <p className="courseOverviewId">
                            Course ID: {selectedCourse._id}
                        </p>
                    </div>

                    <div className="courseOverviewStat">
                        <span className="courseStatIcon blue">👥</span>

                        <h3>{enrolledStudents.length}</h3>

                        <p>Total Enrolled Students</p>
                    </div>

                    <div className="courseOverviewStat">
                        <span className="courseStatIcon green">✓</span>

                        <h3>{activeEnrollments}</h3>

                        <p>Active Enrollments</p>
                    </div>

                    <div className="courseOverviewStat">
                        <span className="courseStatIcon orange">★</span>

                        <h3>{selectedCourse.credits ?? 0}</h3>

                        <p>Course Credits</p>
                    </div>
                </div>

                {/* Course Information */}
                <div className="courseDetailsInformation">
                    <div className="courseSectionHeader">
                        <div>
                            <h2>Course Information</h2>
                            <p>Basic details about this course</p>
                        </div>
                    </div>

                    <div className="courseInformationGrid">
                        <div className="courseInformationItem">
                            <span>Course Name</span>
                            <p>{selectedCourse.name || "Not available"}</p>
                        </div>

                        <div className="courseInformationItem">
                            <span>Course Code</span>
                            <p>{selectedCourse.code || "Not available"}</p>
                        </div>

                        <div className="courseInformationItem">
                            <span>Grade Level</span>
                            <p>{selectedCourse.gradeLevel || "Not available"}</p>
                        </div>

                        <div className="courseInformationItem">
                            <span>Credits</span>
                            <p>{selectedCourse.credits ?? "Not available"}</p>
                        </div>

                        <div className="courseInformationItem">
                            <span>Status</span>
                            <p>
                                <span className={`courseStatus ${courseStatus}`}>
                                    {selectedCourse.status || "Unknown"}
                                </span>
                            </p>
                        </div>

                        <div className="courseInformationItem">
                            <span>Created At</span>
                            <p>{formatDate(selectedCourse.createdAt)}</p>
                        </div>

                        <div className="courseInformationItem fullWidth">
                            <span>Description</span>
                            <p>
                                {selectedCourse.description ||
                                    "No course description available."}
                            </p>
                        </div>

                        <div className="courseInformationItem">
                            <span>Last Updated</span>
                            <p>{formatDate(selectedCourse.updatedAt)}</p>
                        </div>
                    </div>
                </div>

                {/* Assigned Teacher */}
                <div className="courseAssignedTeacher">
                    <div className="courseSectionHeader">
                        <div>
                            <h2>Assigned Teacher</h2>
                            <p>Teacher responsible for this course</p>
                        </div>
                    </div>

                    {assignedTeacher ? (
                        <div className="assignedTeacherCard">
                            <div className="assignedTeacherAvatar">
                                {assignedTeacher.firstName?.charAt(0)}
                                {assignedTeacher.lastName?.charAt(0)}
                            </div>

                            <div className="assignedTeacherInfo">
                                <h3>
                                    {assignedTeacher.firstName}{" "}
                                    {assignedTeacher.lastName}
                                </h3>

                                <p>
                                    {assignedTeacher.specialization ||
                                        "Teacher"}
                                </p>

                                <div className="assignedTeacherDetails">
                                    <span>
                                        <strong>Teacher ID:</strong>{" "}
                                        {assignedTeacher._id}
                                    </span>

                                    <span>
                                        <strong>Email:</strong>{" "}
                                        {assignedTeacher.email || "N/A"}
                                    </span>

                                    <span>
                                        <strong>Phone:</strong>{" "}
                                        {assignedTeacher.phone || "N/A"}
                                    </span>

                                    <span>
                                        <strong>Status:</strong>{" "}
                                        {assignedTeacher.status || "N/A"}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="viewTeacherButton"
                                onClick={() =>
                                    navigate(`/teachers/${assignedTeacher._id}`)
                                }
                            >
                                View Teacher
                            </button>
                        </div>
                    ) : (
                        <div className="courseEmptyState">
                            <p>No teacher assigned to this course.</p>
                        </div>
                    )}
                </div>

                {/* Enrolled Students */}
                <div className="courseEnrolledStudents">
                    <div className="courseSectionHeader">
                        <div>
                            <h2>Enrolled Students</h2>
                            <p>
                                Students currently registered for this course
                            </p>
                        </div>

                        <span className="courseStudentCount">
                            {enrolledStudents.length} Students
                        </span>
                    </div>

                    {enrolledStudents.length === 0 ? (
                        <div className="courseEmptyState">
                            <p>No students enrolled in this course yet.</p>
                        </div>
                    ) : (
                        <div className="courseStudentsTable">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Student ID</th>
                                        <th>Student Name</th>
                                        <th>Email</th>
                                        <th>Grade</th>
                                        <th>Enrollment Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {enrolledStudents.map((student) => (
                                        <tr key={student._id}>
                                            <td className="courseStudentId">
                                                {student._id}
                                            </td>

                                            <td className="courseStudentName">
                                                {student.firstName}{" "}
                                                {student.lastName}
                                            </td>

                                            <td>{student.email || "N/A"}</td>

                                            <td>
                                                {student.gradeLevel || "N/A"}
                                            </td>

                                            <td>
                                                {formatDate(student.enrollmentDate)}
                                            </td>

                                            <td>
                                                <span
                                                    className={`enrollmentStatus ${String(
                                                        student.enrollmentStatus || ""
                                                    ).toLowerCase()}`}
                                                >
                                                    {student.enrollmentStatus ||
                                                        "Unknown"}
                                                </span>
                                            </td>

                                            <td>
                                                <button
                                                    type="button"
                                                    className="viewStudentButton"
                                                    onClick={() =>
                                                        navigate(
                                                            `/students/${student._id}`
                                                        )
                                                    }
                                                >
                                                    View Student
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </section>
        </MainLayout>
    );
}