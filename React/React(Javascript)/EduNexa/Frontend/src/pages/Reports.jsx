
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import MainLayout from "../components/layout/MainLayout";

import {
    students,
    teachers,
    courses,
    enrollments,
    attendance,
    grades
} from "../data/mockData";

import "../styles/Reports.css";

// Safely load data from localStorage
function loadReportData(storageKey, fallbackData) {
    try {
        const savedData = localStorage.getItem(storageKey);

        return savedData ? JSON.parse(savedData) : fallbackData;
    } catch {
        return fallbackData;
    }
}

export default function Reports() {
    const { user } = useAuth();

    const isAdmin = user?.role === "Admin";

    // Load report data
    const [studentList] = useState(() =>
        loadReportData("eduTrackStudents", students)
    );

    const [teacherList] = useState(() =>
        loadReportData("eduTrackTeachers", teachers)
    );

    const [courseList] = useState(() =>
        loadReportData("eduTrackCourses", courses)
    );

    const [enrollmentList] = useState(() =>
        loadReportData("eduTrackEnrollments", enrollments)
    );

    const [attendanceList] = useState(() =>
        loadReportData("eduTrackAttendance", attendance)
    );

    const [gradeList] = useState(() =>
        loadReportData("eduTrackGrades", grades)
    );

    // Filter courses according to user role
    const visibleCourses = isAdmin
        ? courseList
        : courseList.filter(
            (course) => course.teacherId === user?.teacherId
        );

    // Filters
    const [selectedCourse, setSelectedCourse] = useState("All");
    const [selectedGrade, setSelectedGrade] = useState("All");

    const filteredCourses = visibleCourses.filter((course) => {
        const courseMatch =
            selectedCourse === "All" ||
            course._id === selectedCourse;

        const gradeMatch =
            selectedGrade === "All" ||
            String(course.gradeLevel) === selectedGrade;

        return courseMatch && gradeMatch;
    });

    const filteredCourseIds = filteredCourses.map(
        (course) => course._id
    );

    // Filter records using selected courses
    const filteredEnrollments = enrollmentList.filter(
        (enrollment) =>
            filteredCourseIds.includes(enrollment.courseId)
    );

    const filteredAttendance = attendanceList.filter(
        (record) =>
            filteredCourseIds.includes(record.courseId)
    );

    const filteredGrades = gradeList.filter(
        (grade) =>
            filteredCourseIds.includes(grade.courseId)
    );

    // Related students
    const relatedStudentIds = [
        ...new Set([
            ...filteredEnrollments.map((item) => item.studentId),
            ...filteredAttendance.map((item) => item.studentId),
            ...filteredGrades.map((item) => item.studentId)
        ])
    ];

    const visibleStudents = isAdmin
        ? studentList
        : studentList.filter((student) =>
            relatedStudentIds.includes(student._id)
        );

    const visibleTeachers = isAdmin
        ? teacherList
        : teacherList.filter(
            (teacher) => teacher._id === user?.teacherId
        );

    // General statistics
    const totalStudents = visibleStudents.length;
    const totalTeachers = visibleTeachers.length;
    const totalCourses = filteredCourses.length;
    const totalEnrollments = filteredEnrollments.length;

    // Enrollment statistics
    const enrolledCount = filteredEnrollments.filter(
        (item) => item.status === "Enrolled"
    ).length;

    const completedCount = filteredEnrollments.filter(
        (item) => item.status === "Completed"
    ).length;

    const withdrawnCount = filteredEnrollments.filter(
        (item) => item.status === "Withdrawn"
    ).length;

    // Attendance statistics
    const presentCount = filteredAttendance.filter(
        (item) => item.status === "Present"
    ).length;

    const absentCount = filteredAttendance.filter(
        (item) => item.status === "Absent"
    ).length;

    const lateCount = filteredAttendance.filter(
        (item) => item.status === "Late"
    ).length;

    const totalAttendance =
        presentCount + absentCount + lateCount;

    const attendancePercentage = totalAttendance > 0
        ? ((presentCount / totalAttendance) * 100).toFixed(1)
        : "0.0";

    // Grade statistics
    const totalGrades = filteredGrades.length;

    const totalScore = filteredGrades.reduce(
        (total, grade) => total + Number(grade.score || 0),
        0
    );

    const totalMaximumScore = filteredGrades.reduce(
        (total, grade) => total + Number(grade.maxScore || 0),
        0
    );

    const averageGrade = totalMaximumScore > 0
        ? ((totalScore / totalMaximumScore) * 100).toFixed(1)
        : "0.0";

    const passedGrades = filteredGrades.filter((grade) => {
        const maxScore = Number(grade.maxScore);

        return maxScore > 0 &&
            (Number(grade.score) / maxScore) * 100 >= 50;
    }).length;

    const failedGrades = filteredGrades.filter((grade) => {
        const maxScore = Number(grade.maxScore);

        return maxScore > 0 &&
            (Number(grade.score) / maxScore) * 100 < 50;
    }).length;

    // Grade levels available in the user's courses
    const gradeLevels = [
        ...new Set(
            visibleCourses.map((course) =>
                String(course.gradeLevel)
            )
        )
    ].sort((a, b) => Number(a) - Number(b));

    // Clear report filters
    function clearFilters() {
        setSelectedCourse("All");
        setSelectedGrade("All");
    }

    return (
        <MainLayout>
            <section className="reportsPage">

                {/* Page Header */}
                <div className="reportsPageHeader">
                    <div>
                        <h1>Reports</h1>
                        <p>Dashboard / Reports</p>
                    </div>
                </div>

                {/* Report Filters */}
                <div className="reportsFilters">
                    <div className="reportsSectionHeading">
                        <div>
                            <h2>Report Filters</h2>
                            <p>
                                Choose a course and grade level to filter
                                the report data.
                            </p>
                        </div>
                    </div>

                    <div className="reportsFilterControls">
                        <div className="reportsFilterGroup">
                            <label htmlFor="reportCourse">
                                Course
                            </label>

                            <select
                                id="reportCourse"
                                value={selectedCourse}
                                onChange={(event) =>
                                    setSelectedCourse(event.target.value)
                                }
                            >
                                <option value="All">All Courses</option>

                                {visibleCourses.map((course) => (
                                    <option
                                        key={course._id}
                                        value={course._id}
                                    >
                                        {course.name} - {course.code}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="reportsFilterGroup">
                            <label htmlFor="reportGrade">
                                Grade Level
                            </label>

                            <select
                                id="reportGrade"
                                value={selectedGrade}
                                onChange={(event) =>
                                    setSelectedGrade(event.target.value)
                                }
                            >
                                <option value="All">All Grades</option>

                                {gradeLevels.map((level) => (
                                    <option key={level} value={level}>
                                        Grade {level}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="button"
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

                {/* General Overview */}
                <div className="reportsSection">
                    <div className="reportsSectionHeading">
                        <div>
                            <h2>General Overview</h2>
                            <p>
                                A summary of your school information.
                            </p>
                        </div>
                    </div>

                    <div className="reportsOverviewCards">
                        <div className="reportOverviewCard">
                            <div className="reportCardIcon studentsIcon">
                                <span>S</span>
                            </div>

                            <div>
                                <h3>Total Students</h3>
                                <p>{totalStudents}</p>
                            </div>
                        </div>

                        {isAdmin && (
                            <div className="reportOverviewCard">
                                <div className="reportCardIcon teachersIcon">
                                    <span>T</span>
                                </div>

                                <div>
                                    <h3>Total Teachers</h3>
                                    <p>{totalTeachers}</p>
                                </div>
                            </div>
                        )}

                        <div className="reportOverviewCard">
                            <div className="reportCardIcon coursesIcon">
                                <span>C</span>
                            </div>

                            <div>
                                <h3>Total Courses</h3>
                                <p>{totalCourses}</p>
                            </div>
                        </div>

                        <div className="reportOverviewCard">
                            <div className="reportCardIcon enrollmentsIcon">
                                <span>E</span>
                            </div>

                            <div>
                                <h3>Total Enrollments</h3>
                                <p>{totalEnrollments}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enrollment Report */}
                <div className="reportsSection">
                    <div className="reportsSectionHeading">
                        <div>
                            <h2>Enrollment Report</h2>
                            <p>
                                Overview of student enrollment activity.
                            </p>
                        </div>
                    </div>

                    <div className="reportsStatisticsGrid">
                        <div className="reportStatisticCard">
                            <span className="reportStatisticDot enrolledDot"></span>
                            <div>
                                <h3>Enrolled</h3>
                                <p>{enrolledCount}</p>
                            </div>
                        </div>

                        <div className="reportStatisticCard">
                            <span className="reportStatisticDot completedDot"></span>
                            <div>
                                <h3>Completed</h3>
                                <p>{completedCount}</p>
                            </div>
                        </div>

                        <div className="reportStatisticCard">
                            <span className="reportStatisticDot withdrawnDot"></span>
                            <div>
                                <h3>Withdrawn</h3>
                                <p>{withdrawnCount}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attendance Report */}
                <div className="reportsSection">
                    <div className="reportsSectionHeading">
                        <div>
                            <h2>Attendance Report</h2>
                            <p>
                                Summary of recorded student attendance.
                            </p>
                        </div>
                    </div>

                    <div className="reportsStatisticsGrid">
                        <div className="reportStatisticCard">
                            <span className="reportStatisticDot presentDot"></span>
                            <div>
                                <h3>Present</h3>
                                <p>{presentCount}</p>
                            </div>
                        </div>

                        <div className="reportStatisticCard">
                            <span className="reportStatisticDot absentDot"></span>
                            <div>
                                <h3>Absent</h3>
                                <p>{absentCount}</p>
                            </div>
                        </div>

                        <div className="reportStatisticCard">
                            <span className="reportStatisticDot lateDot"></span>
                            <div>
                                <h3>Late</h3>
                                <p>{lateCount}</p>
                            </div>
                        </div>

                        <div className="reportStatisticCard attendanceRateCard">
                            <div>
                                <h3>Attendance Rate</h3>
                                <p>{attendancePercentage}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grades Report */}
                <div className="reportsSection">
                    <div className="reportsSectionHeading">
                        <div>
                            <h2>Grades Report</h2>
                            <p>
                                Summary of student assessment performance.
                            </p>
                        </div>
                    </div>

                    <div className="reportsStatisticsGrid">
                        <div className="reportStatisticCard">
                            <div>
                                <h3>Total Assessments</h3>
                                <p>{totalGrades}</p>
                            </div>
                        </div>

                        <div className="reportStatisticCard averageGradeCard">
                            <div>
                                <h3>Average Score</h3>
                                <p>{averageGrade}%</p>
                            </div>
                        </div>

                        <div className="reportStatisticCard">
                            <span className="reportStatisticDot passedDot"></span>
                            <div>
                                <h3>Passed Results</h3>
                                <p>{passedGrades}</p>
                            </div>
                        </div>

                        <div className="reportStatisticCard">
                            <span className="reportStatisticDot failedDot"></span>
                            <div>
                                <h3>Failed Results</h3>
                                <p>{failedGrades}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Course Overview */}
                <div className="reportsSection courseReportSection">
                    <div className="reportsSectionHeading">
                        <div>
                            <h2>Course Overview</h2>
                            <p>
                                Enrollment, attendance, and assessment
                                records for each course.
                            </p>
                        </div>
                    </div>

                    <div className="reportsCourseTableContainer">
                        {filteredCourses.length === 0 ? (
                            <p className="reportsEmptyMessage">
                                No courses found for the selected filters.
                            </p>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Course</th>
                                        <th>Code</th>
                                        <th>Grade</th>
                                        <th>Enrollments</th>
                                        <th>Attendance Records</th>
                                        <th>Assessments</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredCourses.map((course) => (
                                        <tr key={course._id}>
                                            <td className="reportCourseName">
                                                {course.name}
                                            </td>

                                            <td>{course.code}</td>

                                            <td>
                                                Grade {course.gradeLevel}
                                            </td>

                                            <td>
                                                {
                                                    filteredEnrollments.filter(
                                                        (item) =>
                                                            item.courseId === course._id
                                                    ).length
                                                }
                                            </td>

                                            <td>
                                                {
                                                    filteredAttendance.filter(
                                                        (item) =>
                                                            item.courseId === course._id
                                                    ).length
                                                }
                                            </td>

                                            <td>
                                                {
                                                    filteredGrades.filter(
                                                        (item) =>
                                                            item.courseId === course._id
                                                    ).length
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

            </section>
        </MainLayout>
    );
}
