
import { useState } from "react";

import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../context/AuthContext";

import {
    students,
    teachers,
    courses,
    enrollments,
    attendance,
    grades
} from "../data/mockData";

import "../styles/Dashboard.css";

export default function Dashboard() {
    const { user } = useAuth();

    const isAdmin = user?.role === "Admin";
    const isTeacher = user?.role === "Teacher";

    // Load data from localStorage or mockData
    const [studentList] = useState(() =>
        JSON.parse(localStorage.getItem("eduTrackStudents")) || students
    );

    const [teacherList] = useState(() =>
        JSON.parse(localStorage.getItem("eduTrackTeachers")) || teachers
    );

    const [courseList] = useState(() =>
        JSON.parse(localStorage.getItem("eduTrackCourses")) || courses
    );

    const [enrollmentList] = useState(() =>
        JSON.parse(localStorage.getItem("eduTrackEnrollments")) || enrollments
    );

    const [attendanceList] = useState(() =>
        JSON.parse(localStorage.getItem("eduTrackAttendance")) || attendance
    );

    const [gradeList] = useState(() =>
        JSON.parse(localStorage.getItem("eduTrackGrades")) || grades
    );

    // Get courses according to role
    const myCourses = isAdmin
        ? courseList
        : courseList.filter(
            course => course.teacherId === user?.teacherId
        );

    const myCourseIds = myCourses.map(course => course._id);

    // Get enrollments related to visible courses
    const myEnrollments = enrollmentList.filter(
        enrollment => myCourseIds.includes(enrollment.courseId)
    );

    // Get students related to visible courses
    const myStudentIds = [
        ...new Set(
            myEnrollments
                .filter(enrollment => enrollment.status !== "Withdrawn")
                .map(enrollment => enrollment.studentId)
        )
    ];

    const myStudents = isAdmin
        ? studentList
        : studentList.filter(
            student => myStudentIds.includes(student._id)
        );

    // Get attendance related to visible courses
    const myAttendance = attendanceList.filter(
        record => myCourseIds.includes(record.courseId)
    );

    // Get grades related to visible courses
    const myGrades = gradeList.filter(
        grade => myCourseIds.includes(grade.courseId)
    );

    // Get recent students
    const recentStudents = [...myStudents]
        .sort(
            (a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
        )
        .slice(0, 5);

    // Attendance calculations
    const presentCount = myAttendance.filter(
        record => record.status === "Present"
    ).length;

    const absentCount = myAttendance.filter(
        record => record.status === "Absent"
    ).length;

    const lateCount = myAttendance.filter(
        record => record.status === "Late"
    ).length;

    const totalAttendance = myAttendance.length;

    const attendanceRate = totalAttendance > 0
        ? ((presentCount / totalAttendance) * 100).toFixed(1)
        : 0;

    // Grade calculations
    const totalScore = myGrades.reduce(
        (total, grade) => total + Number(grade.score || 0),
        0
    );

    const totalMaxScore = myGrades.reduce(
        (total, grade) => total + Number(grade.maxScore || 0),
        0
    );

    const averageGrade = totalMaxScore > 0
        ? ((totalScore / totalMaxScore) * 100).toFixed(1)
        : 0;

    // Recent records for activity overview
    const recentActivities = [
        ...myEnrollments.map(item => ({
            id: item._id,
            type: "Enrollment",
            description: `Enrollment ${item._id} - ${item.status}`,
            date: item.enrollmentDate
        })),

        ...myAttendance.map(item => ({
            id: item._id,
            type: "Attendance",
            description: `Attendance recorded - ${item.status}`,
            date: item.date
        })),

        ...myGrades.map(item => ({
            id: item._id,
            type: "Grade",
            description: `${item.assessmentName} - Grade submitted`,
            date: item.date
        }))
    ]
        .sort(
            (a, b) => new Date(b.date) - new Date(a.date)
        )
        .slice(0, 5);

    return (
        <MainLayout>
            <div className="dashboard-page">

                {isAdmin ? (
                    <>
                        {/* Admin Dashboard */}
                        <div>
                            <h2>Admin Dashboard</h2>

                            <div>
                                <h2>Total Students</h2>
                                <p>{studentList.length}</p>
                            </div>

                            <div>
                                <h2>Total Teachers</h2>
                                <p>{teacherList.length}</p>
                            </div>

                            <div>
                                <h2>Total Courses</h2>
                                <p>{courseList.length}</p>
                            </div>

                            <div>
                                <h2>Attendance Rate</h2>
                                <p>{attendanceRate}%</p>
                            </div>

                            <div>
                                <h2>Total Enrollments</h2>
                                <p>{enrollmentList.length}</p>
                            </div>

                            <div>
                                <h2>Active Students</h2>
                                <p>
                                    {
                                        studentList.filter(
                                            student => student.status === "Active"
                                        ).length
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Admin Dashboard Details */}
                        <div>
                            <div>
                                <h2>Recent Students</h2>

                                {recentStudents.length === 0 ? (
                                    <p>No students available.</p>
                                ) : (
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Name</th>
                                                <th>Grade</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {recentStudents.map(student => (
                                                <tr key={student._id}>
                                                    <td>{student._id}</td>
                                                    <td>
                                                        {student.firstName} {student.lastName}
                                                    </td>
                                                    <td>{student.gradeLevel}</td>
                                                    <td>{student.status}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            <div>
                                <h2>Attendance Overview</h2>

                                <p>Total Records: {totalAttendance}</p>
                                <p>Present: {presentCount}</p>
                                <p>Absent: {absentCount}</p>
                                <p>Late: {lateCount}</p>
                                <p>Attendance Rate: {attendanceRate}%</p>
                            </div>

                            <div>
                                <h2>Course Overview</h2>

                                {courseList.length === 0 ? (
                                    <p>No courses available.</p>
                                ) : (
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Course</th>
                                                <th>Code</th>
                                                <th>Grade</th>
                                                <th>Teacher</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {courseList.slice(0, 5).map(course => {
                                                const teacher = teacherList.find(
                                                    item => item._id === course.teacherId
                                                );

                                                return (
                                                    <tr key={course._id}>
                                                        <td>{course.name}</td>
                                                        <td>{course.code}</td>
                                                        <td>{course.gradeLevel}</td>
                                                        <td>
                                                            {teacher
                                                                ? `${teacher.firstName} ${teacher.lastName}`
                                                                : "Not assigned"}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            <div>
                                <h2>Academic Performance</h2>

                                <p>Total Assessments: {myGrades.length}</p>
                                <p>Average Score: {averageGrade}%</p>
                            </div>

                            <div>
                                <h2>Recent Activities</h2>

                                {recentActivities.length === 0 ? (
                                    <p>No recent activities.</p>
                                ) : (
                                    <ul>
                                        {recentActivities.map(activity => (
                                            <li key={`${activity.type}-${activity.id}`}>
                                                <strong>{activity.type}:</strong>{" "}
                                                {activity.description}
                                                <p>{activity.date}</p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </>
                ) : isTeacher ? (
                    <>
                        {/* Teacher Dashboard */}
                        <div>
                            <h2>Teacher Dashboard</h2>

                            <div>
                                <h2>My Courses</h2>
                                <p>{myCourses.length}</p>
                            </div>

                            <div>
                                <h2>My Students</h2>
                                <p>{myStudents.length}</p>
                            </div>

                            <div>
                                <h2>Attendance Records</h2>
                                <p>{myAttendance.length}</p>
                            </div>

                            <div>
                                <h2>Grades Submitted</h2>
                                <p>{myGrades.length}</p>
                            </div>
                        </div>

                        {/* Teacher Dashboard Details */}
                        <div>
                            <div>
                                <h2>My Course Overview</h2>

                                {myCourses.length === 0 ? (
                                    <p>No assigned courses.</p>
                                ) : (
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Course</th>
                                                <th>Code</th>
                                                <th>Grade</th>
                                                <th>Students</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {myCourses.map(course => {
                                                const courseStudentCount = [
                                                    ...new Set(
                                                        myEnrollments
                                                            .filter(
                                                                item =>
                                                                    item.courseId === course._id &&
                                                                    item.status !== "Withdrawn"
                                                            )
                                                            .map(item => item.studentId)
                                                    )
                                                ].length;

                                                return (
                                                    <tr key={course._id}>
                                                        <td>{course.name}</td>
                                                        <td>{course.code}</td>
                                                        <td>{course.gradeLevel}</td>
                                                        <td>{courseStudentCount}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            <div>
                                <h2>My Students Overview</h2>

                                <p>Total Students: {myStudents.length}</p>

                                <p>
                                    Active Students: {
                                        myStudents.filter(
                                            student => student.status === "Active"
                                        ).length
                                    }
                                </p>

                                <p>
                                    Inactive Students: {
                                        myStudents.filter(
                                            student => student.status === "Inactive"
                                        ).length
                                    }
                                </p>
                            </div>

                            <div>
                                <h2>Recent Attendance</h2>

                                {myAttendance.length === 0 ? (
                                    <p>No attendance records available.</p>
                                ) : (
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Student</th>
                                                <th>Course</th>
                                                <th>Date</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {[...myAttendance]
                                                .sort(
                                                    (a, b) =>
                                                        new Date(b.date) - new Date(a.date)
                                                )
                                                .slice(0, 5)
                                                .map(record => {
                                                    const student = myStudents.find(
                                                        item => item._id === record.studentId
                                                    );

                                                    const course = myCourses.find(
                                                        item => item._id === record.courseId
                                                    );

                                                    return (
                                                        <tr key={record._id}>
                                                            <td>
                                                                {student
                                                                    ? `${student.firstName} ${student.lastName}`
                                                                    : record.studentId}
                                                            </td>
                                                            <td>
                                                                {course?.name || record.courseId}
                                                            </td>
                                                            <td>{record.date}</td>
                                                            <td>{record.status}</td>
                                                        </tr>
                                                    );
                                                })}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            <div>
                                <h2>Recent Grades</h2>

                                {myGrades.length === 0 ? (
                                    <p>No grades available.</p>
                                ) : (
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Student</th>
                                                <th>Assessment</th>
                                                <th>Course</th>
                                                <th>Score</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {[...myGrades]
                                                .sort(
                                                    (a, b) =>
                                                        new Date(b.date) - new Date(a.date)
                                                )
                                                .slice(0, 5)
                                                .map(grade => {
                                                    const student = myStudents.find(
                                                        item => item._id === grade.studentId
                                                    );

                                                    const course = myCourses.find(
                                                        item => item._id === grade.courseId
                                                    );

                                                    return (
                                                        <tr key={grade._id}>
                                                            <td>
                                                                {student
                                                                    ? `${student.firstName} ${student.lastName}`
                                                                    : grade.studentId}
                                                            </td>
                                                            <td>{grade.assessmentName}</td>
                                                            <td>
                                                                {course?.name || grade.courseId}
                                                            </td>
                                                            <td>
                                                                {grade.score}/{grade.maxScore}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            <div>
                                <h2>Upcoming Activities</h2>
                                <p>No upcoming activities available yet.</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <h2>You do not have permission to view this dashboard.</h2>
                )}

            </div>
        </MainLayout>
    );
}
