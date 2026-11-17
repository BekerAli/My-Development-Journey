
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

import MainLayout from "../components/layout/MainLayout";

import {
    students,
    courses,
    enrollments
} from "../data/mockData";

import "../styles/StudentDetails.css";

// Empty Edit Form
const emptyStudentForm = {
    firstName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    gradeLevel: "",
    email: "",
    phone: "",
    address: "",
    guardianName: "",
    guardianPhone: ""
};

// Format dates
function formatDate(date) {
    if (!date) return "Not available";

    const formattedDate = new Date(date);

    if (Number.isNaN(formattedDate.getTime())) {
        return "Not available";
    }

    return formattedDate.toLocaleDateString();
}

// Safely load data from localStorage
function loadLocalData(key, fallbackData) {
    try {
        const savedData = localStorage.getItem(key);

        return savedData ? JSON.parse(savedData) : fallbackData;
    } catch {
        return fallbackData;
    }
}

export default function StudentDetails() {
    const { studentId } = useParams();
    const navigate = useNavigate();

    const { user } = useAuth();
    const { addNotification } = useNotifications();

    // Load students from localStorage
    const [studentList, setStudentList] = useState(() =>
        loadLocalData("eduTrackStudents", students)
    );

    // Load enrollments from localStorage
    const [enrollmentList, setEnrollmentList] = useState(() =>
        loadLocalData("eduTrackEnrollments", enrollments)
    );

    // Edit Modal States
    const [showEditModal, setShowEditModal] = useState(false);
    const [editStudentData, setEditStudentData] = useState(emptyStudentForm);
    const [editErrors, setEditErrors] = useState({});

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Find selected student
    const selectedStudent = studentList.find(
        (stud) => stud._id === studentId
    );

    const isAdmin = user?.role === "Admin";

    // Handle invalid student ID
    if (!selectedStudent) {
        return (
            <MainLayout>
                <div className="student-not-found">
                    <h1>Student Not Found</h1>

                    <p>
                        The student you are looking for does not exist.
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/students")}
                    >
                        Back to Students
                    </button>
                </div>
            </MainLayout>
        );
    }

    // Find student's enrollments
    const studentEnrollments = enrollmentList.filter(
        (enrollment) =>
            enrollment.studentId === selectedStudent._id
    );

    // Load courses from localStorage
    const courseList = loadLocalData("eduTrackCourses", courses);

    // Find course details for each enrollment
    const studentCourses = studentEnrollments.map((enrollment) => {
        const course = courseList.find(
            (course) => course._id === enrollment.courseId
        );

        return {
            ...enrollment,
            course
        };
    });

    // Open Edit Student Modal
    const handleOpenEditModal = () => {
        setEditStudentData({
            firstName: selectedStudent.firstName || "",
            lastName: selectedStudent.lastName || "",
            gender: selectedStudent.gender || "",
            dateOfBirth: selectedStudent.dateOfBirth || "",
            gradeLevel: selectedStudent.gradeLevel || "",
            email: selectedStudent.email || "",
            phone: selectedStudent.phone || "",
            address: selectedStudent.address || "",
            guardianName: selectedStudent.guardianName || "",
            guardianPhone: selectedStudent.guardianPhone || ""
        });

        setEditErrors({});
        setShowEditModal(true);
    };

    // Handle Edit Form Changes
    const handleEditChange = (e) => {
        const { name, value } = e.target;

        setEditStudentData((prevData) => ({
            ...prevData,
            [name]: value
        }));

        setEditErrors((prevErrors) => ({
            ...prevErrors,
            [name]: ""
        }));
    };

    // Validate Edit Student Form
    const validateEditStudent = () => {
        const errors = {};

        if (!editStudentData.firstName.trim()) {
            errors.firstName = "First name is required";
        }

        if (!editStudentData.lastName.trim()) {
            errors.lastName = "Last name is required";
        }

        if (!editStudentData.gender) {
            errors.gender = "Please select gender";
        }

        if (!editStudentData.dateOfBirth) {
            errors.dateOfBirth = "Date of birth is required";
        }

        if (!editStudentData.gradeLevel) {
            errors.gradeLevel = "Please select grade level";
        }

        if (!editStudentData.email.trim()) {
            errors.email = "Email is required";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                editStudentData.email.trim()
            )
        ) {
            errors.email = "Enter a valid email address";
        } else if (
            studentList.some(
                (student) =>
                    student._id !== selectedStudent._id &&
                    (student.email || "").toLowerCase() ===
                    editStudentData.email.trim().toLowerCase()
            )
        ) {
            errors.email = "This email is already registered";
        }

        if (!editStudentData.phone.trim()) {
            errors.phone = "Phone number is required";
        } else if (
            !/^\+?[0-9\s-]{7,15}$/.test(
                editStudentData.phone.trim()
            )
        ) {
            errors.phone = "Enter a valid phone number";
        }

        if (!editStudentData.address.trim()) {
            errors.address = "Address is required";
        }

        if (!editStudentData.guardianName.trim()) {
            errors.guardianName = "Guardian name is required";
        }

        if (!editStudentData.guardianPhone.trim()) {
            errors.guardianPhone = "Guardian phone is required";
        } else if (
            !/^\+?[0-9\s-]{7,15}$/.test(
                editStudentData.guardianPhone.trim()
            )
        ) {
            errors.guardianPhone = "Enter a valid guardian phone";
        }

        setEditErrors(errors);

        return Object.keys(errors).length === 0;
    };

    // Save Edited Student
    const handleEditSubmit = (e) => {
        e.preventDefault();

        if (!validateEditStudent()) {
            return;
        }

        const updatedStudent = {
            ...selectedStudent,
            ...editStudentData,
            updatedAt: new Date().toISOString()
        };

        const updatedStudents = studentList.map((student) =>
            student._id === selectedStudent._id
                ? updatedStudent
                : student
        );

        setStudentList(updatedStudents);

        localStorage.setItem(
            "eduTrackStudents",
            JSON.stringify(updatedStudents)
        );

        setShowEditModal(false);
        setEditStudentData(emptyStudentForm);
        setEditErrors({});

        // Success notification
        addNotification(
            "Student Updated Successfully",
            `${updatedStudent.firstName} ${updatedStudent.lastName}'s information has been updated.`,
            "success"
        );
    };

    // Close Edit Modal
    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditStudentData(emptyStudentForm);
        setEditErrors({});
    };

    // Open Delete Confirmation
    const handleOpenDeleteModal = () => {
        setShowDeleteModal(true);
    };

    // Confirm Delete Student
    const handleConfirmDelete = () => {
        const deletedStudentName =
            `${selectedStudent.firstName} ${selectedStudent.lastName}`;

        const updatedStudents = studentList.filter(
            (student) => student._id !== selectedStudent._id
        );

        const updatedEnrollments = enrollmentList.filter(
            (enrollment) =>
                enrollment.studentId !== selectedStudent._id
        );

        setStudentList(updatedStudents);
        setEnrollmentList(updatedEnrollments);

        localStorage.setItem(
            "eduTrackStudents",
            JSON.stringify(updatedStudents)
        );

        localStorage.setItem(
            "eduTrackEnrollments",
            JSON.stringify(updatedEnrollments)
        );

        setShowDeleteModal(false);

        // Success notification
        addNotification(
            "Student Deleted Successfully",
            `${deletedStudentName} has been deleted successfully.`,
            "success"
        );

        navigate("/students");
    };

    // Cancel Delete
    const handleCancelDelete = () => {
        setShowDeleteModal(false);
    };

    return (
        <MainLayout>
            <div className="studentDetailsPage">

                <section className="studentDetailsContent">

                    {/* Page Header */}
                    <div className="studentDetailsPageHeader">
                        <div>
                            <h1>Student Details</h1>

                            <p>
                                Dashboard / Students / Student Details
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate("/students")}
                        >
                            Back to Students
                        </button>
                    </div>

                    {/* Student Profile Header */}
                    <div className="studentProfileHeader">

                        <div className="studentProfileAvatar">
                            {selectedStudent.firstName?.charAt(0)}
                            {selectedStudent.lastName?.charAt(0)}
                        </div>

                        <div className="studentProfileInfo">
                            <h2>
                                {selectedStudent.firstName}{" "}
                                {selectedStudent.lastName}
                            </h2>

                            <p>
                                Student ID: {selectedStudent._id}
                            </p>

                            <p>
                                Grade: {selectedStudent.gradeLevel}
                            </p>

                            <span className="studentStatus">
                                {selectedStudent.status}
                            </span>
                        </div>

                    </div>

                    {/* Information Cards */}
                    <div className="studentInformationCards">

                        {/* Personal Information */}
                        <div className="studentInformationCard">

                            <h2>Personal Information</h2>

                            <div>
                                <span>Student ID</span>
                                <p>{selectedStudent._id}</p>
                            </div>

                            <div>
                                <span>First Name</span>
                                <p>{selectedStudent.firstName}</p>
                            </div>

                            <div>
                                <span>Last Name</span>
                                <p>{selectedStudent.lastName}</p>
                            </div>

                            <div>
                                <span>Gender</span>
                                <p>{selectedStudent.gender}</p>
                            </div>

                            <div>
                                <span>Date of Birth</span>
                                <p>
                                    {formatDate(selectedStudent.dateOfBirth)}
                                </p>
                            </div>

                            <div>
                                <span>Grade Level</span>
                                <p>{selectedStudent.gradeLevel}</p>
                            </div>

                        </div>

                        {/* Contact Information */}
                        <div className="studentInformationCard">

                            <h2>Contact Information</h2>

                            <div>
                                <span>Email</span>
                                <p>{selectedStudent.email}</p>
                            </div>

                            <div>
                                <span>Phone Number</span>
                                <p>{selectedStudent.phone}</p>
                            </div>

                            <div>
                                <span>Address</span>
                                <p>{selectedStudent.address}</p>
                            </div>

                        </div>

                        {/* Guardian Information */}
                        <div className="studentInformationCard">

                            <h2>Guardian Information</h2>

                            <div>
                                <span>Guardian Name</span>
                                <p>{selectedStudent.guardianName}</p>
                            </div>

                            <div>
                                <span>Guardian Phone</span>
                                <p>{selectedStudent.guardianPhone}</p>
                            </div>

                        </div>

                        {/* Academic Information */}
                        <div className="studentInformationCard">

                            <h2>Academic Information</h2>

                            <div>
                                <span>Enrolled Subjects</span>

                                {studentCourses.length === 0 ? (
                                    <p>No subjects enrolled yet.</p>
                                ) : (
                                    studentCourses.map((enrollment) => (
                                        <p key={enrollment._id}>
                                            {enrollment.course?.name || "Course unavailable"}
                                        </p>
                                    ))
                                )}
                            </div>

                            <div>
                                <span>Enrolled Courses</span>
                                <p>{studentCourses.length}</p>
                            </div>

                            <div>
                                <span>Registration Date</span>
                                <p>
                                    {formatDate(selectedStudent.createdAt)}
                                </p>
                            </div>

                            <div>
                                <span>Last Updated</span>
                                <p>
                                    {formatDate(selectedStudent.updatedAt)}
                                </p>
                            </div>

                        </div>

                    </div>

                    {/* Courses Overview */}
                    <div className="studentCoursesOverview">

                        <h2>Enrolled Courses</h2>

                        <div className="studentCoursesTable">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Course ID</th>
                                        <th>Course Name</th>
                                        <th>Grade Level</th>
                                        <th>Enrollment Date</th>
                                        <th>Enrollment Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {studentCourses.length === 0 ? (
                                        <tr>
                                            <td colSpan="5">
                                                This student is not enrolled in any courses.
                                            </td>
                                        </tr>
                                    ) : (
                                        studentCourses.map((enrollment) => (
                                            <tr key={enrollment._id}>
                                                <td>
                                                    {enrollment.course?.code || "Unavailable"}
                                                </td>

                                                <td>
                                                    {enrollment.course?.name || "Unavailable"}
                                                </td>

                                                <td>
                                                    {enrollment.course?.gradeLevel || "Unavailable"}
                                                </td>

                                                <td>
                                                    {formatDate(enrollment.enrollmentDate)}
                                                </td>

                                                <td>
                                                    {enrollment.status}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                    </div>

                    {/* Admin Actions */}
                    {isAdmin && (
                        <div className="studentDetailsActions">
                            <h2>Student Management</h2>

                            <button
                                type="button"
                                onClick={handleOpenEditModal}
                            >
                                Edit Student
                            </button>

                            <button
                                type="button"
                                onClick={handleOpenDeleteModal}
                            >
                                Delete Student
                            </button>
                        </div>
                    )}

                </section>

                {/* Edit Student Modal */}
                {showEditModal && (
                    <div
                        className="modalOverlay"
                        onClick={handleCloseEditModal}
                    >
                        <div
                            className="modalBox"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modalHeader">
                                <div>
                                    <h2>Edit Student</h2>
                                    <p>Update the student's information below.</p>
                                </div>

                                <button
                                    type="button"
                                    className="modalCloseBtn"
                                    onClick={handleCloseEditModal}
                                >
                                    &times;
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit}>
                                <div className="modalBody">

                                    {/* Personal Information */}
                                    <div className="modalSection">
                                        <h3>Personal Information</h3>

                                        <div className="modalFormGrid">

                                            <div className="modalFormGroup">
                                                <label>First Name</label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={editStudentData.firstName}
                                                    onChange={handleEditChange}
                                                />
                                                {editErrors.firstName && (
                                                    <p className="errorMessage">
                                                        {editErrors.firstName}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="modalFormGroup">
                                                <label>Last Name</label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={editStudentData.lastName}
                                                    onChange={handleEditChange}
                                                />
                                                {editErrors.lastName && (
                                                    <p className="errorMessage">
                                                        {editErrors.lastName}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="modalFormGroup">
                                                <label>Gender</label>
                                                <select
                                                    name="gender"
                                                    value={editStudentData.gender}
                                                    onChange={handleEditChange}
                                                >
                                                    <option value="">Select gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                </select>
                                                {editErrors.gender && (
                                                    <p className="errorMessage">
                                                        {editErrors.gender}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="modalFormGroup">
                                                <label>Date of Birth</label>
                                                <input
                                                    type="date"
                                                    name="dateOfBirth"
                                                    value={editStudentData.dateOfBirth}
                                                    onChange={handleEditChange}
                                                />
                                                {editErrors.dateOfBirth && (
                                                    <p className="errorMessage">
                                                        {editErrors.dateOfBirth}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="modalFormGroup">
                                                <label>Grade Level</label>
                                                <select
                                                    name="gradeLevel"
                                                    value={editStudentData.gradeLevel}
                                                    onChange={handleEditChange}
                                                >
                                                    <option value="">Select grade</option>

                                                    {Array.from(
                                                        { length: 12 },
                                                        (_, i) => (
                                                            <option
                                                                key={i + 1}
                                                                value={`Grade ${i + 1}`}
                                                            >
                                                                Grade {i + 1}
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                                {editErrors.gradeLevel && (
                                                    <p className="errorMessage">
                                                        {editErrors.gradeLevel}
                                                    </p>
                                                )}
                                            </div>

                                        </div>
                                    </div>

                                    {/* Contact Information */}
                                    <div className="modalSection">
                                        <h3>Contact Information</h3>

                                        <div className="modalFormGrid">

                                            <div className="modalFormGroup">
                                                <label>Email Address</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={editStudentData.email}
                                                    onChange={handleEditChange}
                                                />
                                                {editErrors.email && (
                                                    <p className="errorMessage">
                                                        {editErrors.email}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="modalFormGroup">
                                                <label>Phone Number</label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={editStudentData.phone}
                                                    onChange={handleEditChange}
                                                />
                                                {editErrors.phone && (
                                                    <p className="errorMessage">
                                                        {editErrors.phone}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="modalFormGroup fullWidth">
                                                <label>Address</label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={editStudentData.address}
                                                    onChange={handleEditChange}
                                                />
                                                {editErrors.address && (
                                                    <p className="errorMessage">
                                                        {editErrors.address}
                                                    </p>
                                                )}
                                            </div>

                                        </div>
                                    </div>

                                    {/* Guardian Information */}
                                    <div className="modalSection">
                                        <h3>Guardian Information</h3>

                                        <div className="modalFormGrid">

                                            <div className="modalFormGroup">
                                                <label>Guardian Name</label>
                                                <input
                                                    type="text"
                                                    name="guardianName"
                                                    value={editStudentData.guardianName}
                                                    onChange={handleEditChange}
                                                />
                                                {editErrors.guardianName && (
                                                    <p className="errorMessage">
                                                        {editErrors.guardianName}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="modalFormGroup">
                                                <label>Guardian Phone</label>
                                                <input
                                                    type="tel"
                                                    name="guardianPhone"
                                                    value={editStudentData.guardianPhone}
                                                    onChange={handleEditChange}
                                                />
                                                {editErrors.guardianPhone && (
                                                    <p className="errorMessage">
                                                        {editErrors.guardianPhone}
                                                    </p>
                                                )}
                                            </div>

                                        </div>
                                    </div>

                                </div>

                                <div className="modalFooter">
                                    <button
                                        type="button"
                                        className="modalCancelBtn"
                                        onClick={handleCloseEditModal}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="modalSaveBtn"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div
                        className="modalOverlay"
                        onClick={handleCancelDelete}
                    >
                        <div
                            className="modalBox deleteConfirmationBox"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modalHeader">
                                <div>
                                    <h2>Delete Student</h2>
                                    <p>Please confirm this action.</p>
                                </div>

                                <button
                                    type="button"
                                    className="modalCloseBtn"
                                    onClick={handleCancelDelete}
                                >
                                    &times;
                                </button>
                            </div>

                            <div className="modalBody">
                                <p>
                                    Are you sure you want to delete{" "}
                                    <strong>
                                        {selectedStudent.firstName}{" "}
                                        {selectedStudent.lastName}
                                    </strong>
                                    ?
                                </p>

                                <p>This action cannot be undone.</p>
                            </div>

                            <div className="modalFooter">
                                <button
                                    type="button"
                                    className="modalCancelBtn"
                                    onClick={handleCancelDelete}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="modalDeleteBtn"
                                    onClick={handleConfirmDelete}
                                >
                                    Delete Student
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </MainLayout>
    );
}
