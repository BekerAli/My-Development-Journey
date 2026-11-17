
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

import MainLayout from "../components/layout/MainLayout";

import { students, enrollments } from "../data/mockData";

import {
    searchStudentData,
    filterStudentData,
    sortStudentData
} from "../services/studentService";

import "../styles/Students.css";

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

export default function Students() {
    const { user } = useAuth();
    const { addNotification } = useNotifications();
    const navigatePage = useNavigate();

    const isTeacher = user?.role === "Teacher";

    // Student list
    const [studentList, setStudentList] = useState(() => {
        try {
            const savedStudents = localStorage.getItem("eduTrackStudents");
            return savedStudents ? JSON.parse(savedStudents) : students;
        } catch {
            return students;
        }
    });

    // Form data and validation
    const [addStudentData, setAddStudentData] = useState(emptyStudentForm);
    const [addStudentErrors, setAddStudentErrors] = useState({});

    // Edit modal
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // Delete modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);

    // Add modal
    const [showModal, setShowModal] = useState(false);

    // Search, filter, sort and pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [searchedValue, setSearchedValue] = useState("");
    const [selectedGrade, setSelectedGrade] = useState("All Grades");
    const [selectedStatus, setSelectedStatus] = useState("All Statuses");
    const [selectedGender, setSelectedGender] = useState("All Genders");
    const [sortOption, setSortOption] = useState("name-asc");

    // Save student data
    const saveStudentList = (updatedStudents) => {
        localStorage.setItem(
            "eduTrackStudents",
            JSON.stringify(updatedStudents)
        );

        setStudentList(updatedStudents);
    };

    // Search students
    const searchedStudents = searchedValue.trim() === ""
        ? studentList
        : searchStudentData(studentList, searchedValue);

    // Filter students
    const filteredStudents = filterStudentData(
        searchedStudents,
        selectedGrade,
        selectedStatus,
        selectedGender
    );

    // Sort students
    const sortedStudentData = sortStudentData(
        filteredStudents,
        sortOption
    );

    // Pagination
    const studentsPerPage = 5;

    const totalPages = Math.ceil(
        sortedStudentData.length / studentsPerPage
    );

    const startIndex = (currentPage - 1) * studentsPerPage;
    const endIndex = startIndex + studentsPerPage;

    const currentStudents = sortedStudentData.slice(
        startIndex,
        endIndex
    );

    // Navigate to Student Details
    const handleViewbtn = (studentId) => {
        navigatePage(`/students/${studentId}`);
    };

    // Validate Add and Edit form
    const validateAddStudent = () => {
        const errors = {};

        if (!addStudentData.firstName.trim()) {
            errors.firstName = "First name is required";
        }

        if (!addStudentData.lastName.trim()) {
            errors.lastName = "Last name is required";
        }

        if (!addStudentData.gender) {
            errors.gender = "Please select gender";
        }

        if (!addStudentData.dateOfBirth) {
            errors.dateOfBirth = "Date of birth is required";
        }

        if (!addStudentData.gradeLevel) {
            errors.gradeLevel = "Please select grade level";
        }

        if (!addStudentData.email.trim()) {
            errors.email = "Email is required";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                addStudentData.email.trim()
            )
        ) {
            errors.email = "Enter a valid email address";
        } else if (
            studentList.some(
                (student) =>
                    student._id !== selectedStudent?._id &&
                    student.email.toLowerCase() ===
                    addStudentData.email.trim().toLowerCase()
            )
        ) {
            errors.email = "This email is already registered";
        }

        if (!addStudentData.phone.trim()) {
            errors.phone = "Phone number is required";
        } else if (
            !/^\+?[0-9\s-]{7,15}$/.test(
                addStudentData.phone.trim()
            )
        ) {
            errors.phone = "Enter a valid phone number";
        }

        if (!addStudentData.address.trim()) {
            errors.address = "Address is required";
        }

        if (!addStudentData.guardianName.trim()) {
            errors.guardianName = "Guardian name is required";
        }

        if (!addStudentData.guardianPhone.trim()) {
            errors.guardianPhone = "Guardian phone is required";
        } else if (
            !/^\+?[0-9\s-]{7,15}$/.test(
                addStudentData.guardianPhone.trim()
            )
        ) {
            errors.guardianPhone = "Enter a valid guardian phone";
        }

        setAddStudentErrors(errors);

        return Object.keys(errors).length === 0;
    };

    // Handle changes in Add/Edit form
    const handleAddStudentChange = (e) => {
        const { name, value } = e.target;

        setAddStudentData((prevData) => ({
            ...prevData,
            [name]: value
        }));

        setAddStudentErrors((prevErrors) => ({
            ...prevErrors,
            [name]: ""
        }));
    };

    // Generate the next Student ID
    const generateStudentId = () => {
        const highestId = studentList.reduce((highest, student) => {
            const idNumber = Number(
                String(student._id).replace("STU", "")
            );

            return idNumber > highest ? idNumber : highest;
        }, 0);

        return `STU${String(highestId + 1).padStart(3, "0")}`;
    };

    // Open Add Student modal
    const handleOpenAddModal = () => {
        setSelectedStudent(null);
        setAddStudentData(emptyStudentForm);
        setAddStudentErrors({});
        setShowEditModal(false);
        setShowModal(true);
    };

    // Add Student
    const handleAddStudentSubmit = (e) => {
        e.preventDefault();

        if (!validateAddStudent()) return;

        const currentDate = new Date().toISOString();

        const newStudent = {
            _id: generateStudentId(),
            ...addStudentData,
            status: "Active",
            createdAt: currentDate,
            updatedAt: currentDate
        };

        const updatedStudents = [
            ...studentList,
            newStudent
        ];

        try {
            saveStudentList(updatedStudents);

            setCurrentPage(
                Math.ceil(updatedStudents.length / studentsPerPage)
            );

            setShowModal(false);
            setAddStudentData(emptyStudentForm);
            setAddStudentErrors({});

            // ADD NOTIFICATION
            addNotification(
                "Student Added Successfully",
                `${newStudent.firstName} ${newStudent.lastName} has been added to the student list.`,
                "success"
            );
        } catch (error) {
            console.error("Could not add student:", error);

            addNotification(
                "Student Addition Failed",
                "The student could not be saved. Please try again.",
                "error"
            );
        }
    };

    // Close Add Student modal
    const handleCloseModal = () => {
        setShowModal(false);
        setAddStudentData(emptyStudentForm);
        setAddStudentErrors({});
    };

    // Open Edit Student modal
    const handleEditStudent = (student) => {
        setSelectedStudent(student);

        setAddStudentData({
            firstName: student.firstName || "",
            lastName: student.lastName || "",
            gender: student.gender || "",
            dateOfBirth: student.dateOfBirth || "",
            gradeLevel: student.gradeLevel || "",
            email: student.email || "",
            phone: student.phone || "",
            address: student.address || "",
            guardianName: student.guardianName || "",
            guardianPhone: student.guardianPhone || ""
        });

        setAddStudentErrors({});
        setShowModal(false);
        setShowEditModal(true);
    };

    // Save Edited Student
    const handleEditStudentSubmit = (e) => {
        e.preventDefault();

        if (!validateAddStudent()) return;

        const updatedStudent = {
            ...selectedStudent,
            ...addStudentData,
            updatedAt: new Date().toISOString()
        };

        const updatedStudents = studentList.map((student) =>
            student._id === selectedStudent._id
                ? updatedStudent
                : student
        );

        try {
            saveStudentList(updatedStudents);

            handleCloseEditModal();

            // EDIT NOTIFICATION
            addNotification(
                "Student Updated Successfully",
                `${updatedStudent.firstName} ${updatedStudent.lastName}'s information has been updated.`,
                "success"
            );
        } catch (error) {
            console.error("Could not update student:", error);

            addNotification(
                "Student Update Failed",
                "The student information could not be updated.",
                "error"
            );
        }
    };

    // Close Edit Student modal
    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setSelectedStudent(null);
        setAddStudentData(emptyStudentForm);
        setAddStudentErrors({});
    };

    // Open Delete Confirmation Modal
    const handleDeleteStudent = (student) => {
        setStudentToDelete(student);
        setShowDeleteModal(true);
    };

    // Confirm Delete Student
    const confirmDeleteStudent = () => {
        if (!studentToDelete) return;

        const deletedStudent = studentToDelete;

        const updatedStudents = studentList.filter(
            (stud) => stud._id !== deletedStudent._id
        );

        try {
            // Save updated student list
            saveStudentList(updatedStudents);

            // Remove related enrollments
            try {
                const savedEnrollments = localStorage.getItem(
                    "eduTrackEnrollments"
                );

                const currentEnrollments = savedEnrollments
                    ? JSON.parse(savedEnrollments)
                    : enrollments;

                const updatedEnrollments = currentEnrollments.filter(
                    (enrollment) =>
                        enrollment.studentId !== deletedStudent._id
                );

                localStorage.setItem(
                    "eduTrackEnrollments",
                    JSON.stringify(updatedEnrollments)
                );
            } catch (error) {
                console.error(
                    "Could not update enrollments:",
                    error
                );
            }

            const updatedTotalPages = Math.ceil(
                updatedStudents.length / studentsPerPage
            );

            if (currentPage > updatedTotalPages) {
                setCurrentPage(Math.max(1, updatedTotalPages));
            }

            setShowDeleteModal(false);
            setStudentToDelete(null);

            // DELETE NOTIFICATION
            addNotification(
                "Student Deleted Successfully",
                `${deletedStudent.firstName} ${deletedStudent.lastName} has been removed from the student list.`,
                "success"
            );
        } catch (error) {
            console.error("Could not delete student:", error);

            addNotification(
                "Student Deletion Failed",
                "The student could not be deleted. Please try again.",
                "error"
            );
        }
    };

    // Cancel Delete
    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setStudentToDelete(null);
    };

    return (
        <MainLayout>
            <div className="students-page">

                {/* Page Header */}
                <div className="studentsPageHeader">
                    <div className="leftSide">
                        <h1>{isTeacher ? "My Students" : "Students"}</h1>
                        <p>
                            Dashboard / {isTeacher ? "My Students" : "Students"}
                        </p>
                    </div>

                    <div className="rightSide">
                        {!isTeacher && (
                            <button
                                type="button"
                                onClick={handleOpenAddModal}
                            >
                                + Add Student
                            </button>
                        )}
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="studentsSummaryCards">
                    <div>
                        <h2>Total Students</h2>
                        <p>{studentList.length}</p>
                    </div>

                    <div>
                        <h2>Active Students</h2>
                        <p>
                            {studentList.filter(
                                (stud) => stud.status === "Active"
                            ).length}
                        </p>
                    </div>

                    <div>
                        <h2>Inactive Students</h2>
                        <p>
                            {studentList.filter(
                                (stud) => stud.status === "Inactive"
                            ).length}
                        </p>
                    </div>
                </div>

                {/* Student List */}
                <div className="studentPageContent">
                    <h2>Student List</h2>

                    {/* Search and Filter */}
                    <div className="studentPageContentHeader">
                        <input
                            type="text"
                            value={searchedValue}
                            onChange={(e) => {
                                setSearchedValue(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Search by ID, name or Email..."
                        />

                        <div className="allFilterTypes">
                            <div>
                                <label htmlFor="grade">Grade</label>
                                <select
                                    id="grade"
                                    value={selectedGrade}
                                    onChange={(e) => {
                                        setSelectedGrade(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="All Grades">All Grades</option>
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option
                                            key={i + 1}
                                            value={`Grade ${i + 1}`}
                                        >
                                            Grade {i + 1}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="status">Status</label>
                                <select
                                    id="status"
                                    value={selectedStatus}
                                    onChange={(e) => {
                                        setSelectedStatus(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="All Statuses">All Statuses</option>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="gender">Gender</label>
                                <select
                                    id="gender"
                                    value={selectedGender}
                                    onChange={(e) => {
                                        setSelectedGender(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="All Genders">All Genders</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="sort">Sort By</label>
                                <select
                                    id="sort"
                                    value={sortOption}
                                    onChange={(e) => {
                                        setSortOption(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <optgroup label="Name">
                                        <option value="name-asc">Name (A–Z)</option>
                                        <option value="name-desc">Name (Z–A)</option>
                                    </optgroup>

                                    <optgroup label="Student ID">
                                        <option value="id-asc">Student ID (A–Z)</option>
                                        <option value="id-desc">Student ID (Z–A)</option>
                                    </optgroup>

                                    <optgroup label="Grade">
                                        <option value="grade-asc">Grade (Low–High)</option>
                                        <option value="grade-desc">Grade (High–Low)</option>
                                    </optgroup>

                                    <optgroup label="Registration Date">
                                        <option value="date-desc">Newest First</option>
                                        <option value="date-asc">Oldest First</option>
                                    </optgroup>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Student Table */}
                    <div className="studentContentMainPart">
                        <table>
                            <thead>
                                <tr>
                                    <th>Student ID</th>
                                    <th>Student Name</th>
                                    <th>Student Email</th>
                                    <th>Student Phone Number</th>
                                    <th>Student Grade</th>
                                    <th>Student Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {currentStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan="7">
                                            There are no students saved.
                                        </td>
                                    </tr>
                                ) : (
                                    currentStudents.map((stud) => (
                                        <tr key={stud._id}>
                                            <td>{stud._id}</td>
                                            <td>
                                                {stud.firstName} {stud.lastName}
                                            </td>
                                            <td>{stud.email}</td>
                                            <td>{stud.phone}</td>
                                            <td>{stud.gradeLevel}</td>
                                            <td>{stud.status}</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    onClick={() => handleViewbtn(stud._id)}
                                                >
                                                    View
                                                </button>

                                                {!isTeacher && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEditStudent(stud)}
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteStudent(stud)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="studentsPagination">
                        <p>
                            Showing{" "}
                            {sortedStudentData.length === 0 ? 0 : startIndex + 1}
                            –
                            {Math.min(endIndex, sortedStudentData.length)} of{" "}
                            {sortedStudentData.length} students
                        </p>

                        <div>
                            <button
                                type="button"
                                onClick={() => setCurrentPage((page) => page - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>

                            <button
                                type="button"
                                onClick={() => setCurrentPage((page) => page + 1)}
                                disabled={
                                    currentPage === totalPages ||
                                    totalPages === 0
                                }
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>

                {/* Add / Edit Student Modal */}
                {(showModal || showEditModal) && (
                    <div
                        className="modalOverlay"
                        onClick={
                            showEditModal
                                ? handleCloseEditModal
                                : handleCloseModal
                        }
                    >
                        <div
                            className="modalBox"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="modalHeader">
                                <div>
                                    <h2>
                                        {showEditModal
                                            ? "Edit Student"
                                            : "Add New Student"}
                                    </h2>

                                    <p>
                                        {showEditModal
                                            ? "Update the student's information below."
                                            : "Enter the student's information below."}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="modalCloseBtn"
                                    onClick={
                                        showEditModal
                                            ? handleCloseEditModal
                                            : handleCloseModal
                                    }
                                >
                                    &times;
                                </button>
                            </div>

                            {/* Modal Form */}
                            <form
                                onSubmit={
                                    showEditModal
                                        ? handleEditStudentSubmit
                                        : handleAddStudentSubmit
                                }
                            >
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
                                                    value={addStudentData.firstName}
                                                    onChange={handleAddStudentChange}
                                                    placeholder="Enter first name"
                                                />
                                                {addStudentErrors.firstName && (
                                                    <p className="errorMessage">
                                                        {addStudentErrors.firstName}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="modalFormGroup">
                                                <label>Last Name</label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={addStudentData.lastName}
                                                    onChange={handleAddStudentChange}
                                                    placeholder="Enter last name"
                                                />
                                                {addStudentErrors.lastName && (
                                                    <p className="errorMessage">
                                                        {addStudentErrors.lastName}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="modalFormGroup">
                                                <label>Gender</label>
                                                <select
                                                    name="gender"
                                                    value={addStudentData.gender}
                                                    onChange={handleAddStudentChange}
                                                >
                                                    <option value="">Select gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                </select>
                                                {addStudentErrors.gender && (
                                                    <p className="errorMessage">
                                                        {addStudentErrors.gender}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="modalFormGroup">
                                                <label>Date of Birth</label>
                                                <input
                                                    type="date"
                                                    name="dateOfBirth"
                                                    value={addStudentData.dateOfBirth}
                                                    onChange={handleAddStudentChange}
                                                />
                                                {addStudentErrors.dateOfBirth && (
                                                    <p className="errorMessage">
                                                        {addStudentErrors.dateOfBirth}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="modalFormGroup">
                                                <label>Grade Level</label>
                                                <select
                                                    name="gradeLevel"
                                                    value={addStudentData.gradeLevel}
                                                    onChange={handleAddStudentChange}
                                                >
                                                    <option value="">Select grade</option>
                                                    {Array.from({ length: 12 }, (_, i) => (
                                                        <option
                                                            key={i + 1}
                                                            value={`Grade ${i + 1}`}
                                                        >
                                                            Grade {i + 1}
                                                        </option>
                                                    ))}
                                                </select>
                                                {addStudentErrors.gradeLevel && (
                                                    <p className="errorMessage">
                                                        {addStudentErrors.gradeLevel}
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
                                                    value={addStudentData.email}
                                                    onChange={handleAddStudentChange}
                                                    placeholder="Enter email address"
                                                />
                                                {addStudentErrors.email && (
                                                    <p className="errorMessage">
                                                        {addStudentErrors.email}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="modalFormGroup">
                                                <label>Phone Number</label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={addStudentData.phone}
                                                    onChange={handleAddStudentChange}
                                                    placeholder="Enter phone number"
                                                />
                                                {addStudentErrors.phone && (
                                                    <p className="errorMessage">
                                                        {addStudentErrors.phone}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="modalFormGroup fullWidth">
                                                <label>Address</label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={addStudentData.address}
                                                    onChange={handleAddStudentChange}
                                                    placeholder="Enter address"
                                                />
                                                {addStudentErrors.address && (
                                                    <p className="errorMessage">
                                                        {addStudentErrors.address}
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
                                                    value={addStudentData.guardianName}
                                                    onChange={handleAddStudentChange}
                                                    placeholder="Enter guardian name"
                                                />
                                                {addStudentErrors.guardianName && (
                                                    <p className="errorMessage">
                                                        {addStudentErrors.guardianName}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="modalFormGroup">
                                                <label>Guardian Phone</label>
                                                <input
                                                    type="tel"
                                                    name="guardianPhone"
                                                    value={addStudentData.guardianPhone}
                                                    onChange={handleAddStudentChange}
                                                    placeholder="Enter guardian phone"
                                                />
                                                {addStudentErrors.guardianPhone && (
                                                    <p className="errorMessage">
                                                        {addStudentErrors.guardianPhone}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="modalFooter">
                                    <button
                                        type="button"
                                        className="modalCancelBtn"
                                        onClick={
                                            showEditModal
                                                ? handleCloseEditModal
                                                : handleCloseModal
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="modalSaveBtn"
                                    >
                                        {showEditModal
                                            ? "Save Changes"
                                            : "Save Student"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && studentToDelete && (
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
                                        {studentToDelete.firstName}{" "}
                                        {studentToDelete.lastName}
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
                                    onClick={confirmDeleteStudent}
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
