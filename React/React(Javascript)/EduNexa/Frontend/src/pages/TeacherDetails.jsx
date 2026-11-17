
import { useParams, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import MainLayout from "../components/layout/MainLayout";

import {
    teachers,
    courses
} from "../data/mockData";

import { useState } from "react";

import "../styles/TeacherDetails.css";

// Format Dates
function formatDate(date) {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString();
}

export default function TeacherDetails() {
    const { teacherId } = useParams();
    const navigate = useNavigate();

    const { user } = useAuth();

    // Load Teachers from localStorage
    const [teacherList] = useState(() => {
        try {
            const savedTeachers = localStorage.getItem("eduTrackTeachers");

            return savedTeachers
                ? JSON.parse(savedTeachers)
                : teachers;
        } catch {
            return teachers;
        }
    });

    // Load Courses from localStorage
    const [courseList] = useState(() => {
        try {
            const savedCourses = localStorage.getItem("eduTrackCourses");

            return savedCourses
                ? JSON.parse(savedCourses)
                : courses;
        } catch {
            return courses;
        }
    });

    // Find Selected Teacher
    const selectedTeacher = teacherList.find(
        (teacher) => teacher._id === teacherId
    );

    const isAdmin = user?.role === "Admin";

    // Handle Teacher Not Found
    if (!selectedTeacher) {
        return (
            <MainLayout>
                <div className="teacher-not-found">

                    <h1>Teacher Not Found</h1>

                    <p>
                        The teacher you are looking for does not exist.
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/teachers")}
                    >
                        Back to Teachers
                    </button>

                </div>
            </MainLayout>
        );
    }

    // Find Courses Assigned to This Teacher
    const teacherCourses = courseList.filter(
        (course) => course.teacherId === selectedTeacher._id
    );

    return (
        <MainLayout>
            <div className="teacherDetailsPage">

                <section className="teacherDetailsContent">

                    {/* Page Header */}
                    <div className="teacherDetailsPageHeader">

                        <div>
                            <h1>Teacher Details</h1>

                            <p>
                                Dashboard / Teachers / Teacher Details
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate("/teachers")}
                        >
                            Back to Teachers
                        </button>

                    </div>

                    {/* Teacher Profile Header */}
                    <div className="teacherProfileHeader">

                        <div className="teacherProfileAvatar">
                            {selectedTeacher.firstName.charAt(0)}
                            {selectedTeacher.lastName.charAt(0)}
                        </div>

                        <div className="teacherProfileInfo">

                            <h2>
                                {selectedTeacher.firstName}{" "}
                                {selectedTeacher.lastName}
                            </h2>

                            <p>
                                Teacher ID: {selectedTeacher._id}
                            </p>

                            <p>
                                Specialization: {selectedTeacher.specialization}
                            </p>

                            <span className="teacherStatus">
                                {selectedTeacher.status}
                            </span>

                        </div>

                    </div>

                    {/* Teacher Information Cards */}
                    <div className="teacherInformationCards">

                        {/* Personal Information */}
                        <div className="teacherInformationCard">

                            <h2>Personal Information</h2>

                            <div>
                                <span>Teacher ID</span>
                                <p>{selectedTeacher._id}</p>
                            </div>

                            <div>
                                <span>First Name</span>
                                <p>{selectedTeacher.firstName}</p>
                            </div>

                            <div>
                                <span>Last Name</span>
                                <p>{selectedTeacher.lastName}</p>
                            </div>

                            <div>
                                <span>Gender</span>
                                <p>{selectedTeacher.gender}</p>
                            </div>

                            <div>
                                <span>Date of Birth</span>
                                <p>
                                    {formatDate(selectedTeacher.dateOfBirth)}
                                </p>
                            </div>

                        </div>

                        {/* Contact Information */}
                        <div className="teacherInformationCard">

                            <h2>Contact Information</h2>

                            <div>
                                <span>Email</span>
                                <p>{selectedTeacher.email}</p>
                            </div>

                            <div>
                                <span>Phone Number</span>
                                <p>{selectedTeacher.phone}</p>
                            </div>

                            <div>
                                <span>Address</span>
                                <p>{selectedTeacher.address}</p>
                            </div>

                        </div>

                        {/* Professional Information */}
                        <div className="teacherInformationCard">

                            <h2>Professional Information</h2>

                            <div>
                                <span>Qualification</span>
                                <p>{selectedTeacher.qualification}</p>
                            </div>

                            <div>
                                <span>Specialization</span>
                                <p>{selectedTeacher.specialization}</p>
                            </div>

                            <div>
                                <span>Hire Date</span>
                                <p>
                                    {formatDate(selectedTeacher.hireDate)}
                                </p>
                            </div>

                            <div>
                                <span>Employment Status</span>
                                <p>{selectedTeacher.status}</p>
                            </div>

                        </div>

                        {/* Record Information */}
                        <div className="teacherInformationCard">

                            <h2>Record Information</h2>

                            <div>
                                <span>Registration Date</span>
                                <p>
                                    {formatDate(selectedTeacher.createdAt)}
                                </p>
                            </div>

                            <div>
                                <span>Last Updated</span>
                                <p>
                                    {formatDate(selectedTeacher.updatedAt)}
                                </p>
                            </div>

                            <div>
                                <span>Assigned Courses</span>
                                <p>{teacherCourses.length}</p>
                            </div>

                        </div>

                    </div>

                    {/* Assigned Courses Overview */}
                    <div className="teacherCoursesOverview">

                        <h2>Assigned Courses</h2>

                        <div className="teacherCoursesTable">

                            <table>

                                <thead>
                                    <tr>
                                        <th>Course ID</th>
                                        <th>Course Name</th>
                                        <th>Course Code</th>
                                        <th>Grade Level</th>
                                        <th>Credits</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {teacherCourses.length === 0 ? (
                                        <tr>
                                            <td colSpan="6">
                                                No courses assigned to this teacher yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        teacherCourses.map((course) => (
                                            <tr key={course._id}>

                                                <td>{course._id}</td>

                                                <td>{course.name}</td>

                                                <td>{course.code}</td>

                                                <td>{course.gradeLevel}</td>

                                                <td>{course.credits}</td>

                                                <td>{course.status}</td>

                                            </tr>
                                        ))
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </section>

            </div>
        </MainLayout>
    );
}
