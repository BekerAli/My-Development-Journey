
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

import MainLayout from "../components/layout/MainLayout";

import "../styles/Enrollments.css";

import {
    students,
    courses,
    enrollments
} from "../data/mockData";

export default function Enrollments() {
    const { user } = useAuth();
    const { addNotification } = useNotifications();
    const navigate = useNavigate();

    const isAdmin = user?.role === "Admin";

    // =========================================
    // LOAD DATA
    // =========================================

    const [enrollmentList, setEnrollmentList] = useState(() => {
        try {
            const saved = localStorage.getItem("eduTrackEnrollments");
            return saved ? JSON.parse(saved) : enrollments;
        } catch {
            return enrollments;
        }
    });

    const [studentList] = useState(() => {
        try {
            const saved = localStorage.getItem("eduTrackStudents");
            return saved ? JSON.parse(saved) : students;
        } catch {
            return students;
        }
    });

    const [courseList] = useState(() => {
        try {
            const saved = localStorage.getItem("eduTrackCourses");
            return saved ? JSON.parse(saved) : courses;
        } catch {
            return courses;
        }
    });

    // =========================================
    // SEARCH AND FILTER STATES
    // =========================================

    const [searchValue, setSearchValue] = useState("");
    const [filterCourse, setFilterCourse] = useState("");
    const [filterGrade, setFilterGrade] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    // =========================================
    // SORTING STATES
    // =========================================

    const [sortBy, setSortBy] = useState("enrollmentDate");
    const [sortOrder, setSortOrder] = useState("desc");

    // =========================================
    // PAGINATION
    // =========================================

    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 5;

    // =========================================
    // MODAL STATES
    // =========================================

    const [showModal, setShowModal] = useState(false);
    const [editingEnrollment, setEditingEnrollment] = useState(null);
    const [deleteEnrollment, setDeleteEnrollment] = useState(null);

    // =========================================
    // FORM STATES
    // =========================================

    const [formData, setFormData] = useState({
        studentId: "",
        courseId: "",
        enrollmentDate: new Date().toISOString().split("T")[0],
        status: "Enrolled"
    });

    const [formError, setFormError] = useState("");

    // =========================================
    // SAVE ENROLLMENTS
    // =========================================

    function saveEnrollments(updatedEnrollments) {
        setEnrollmentList(updatedEnrollments);

        localStorage.setItem(
            "eduTrackEnrollments",
            JSON.stringify(updatedEnrollments)
        );
    }

    // =========================================
    // GET STUDENT INFORMATION
    // =========================================

    function getStudent(studentId) {
        return studentList.find(
            (student) => student._id === studentId
        );
    }

    function getStudentName(studentId) {
        const student = getStudent(studentId);

        return student
            ? `${student.firstName} ${student.lastName}`
            : "Unknown Student";
    }

    // =========================================
    // GET COURSE INFORMATION
    // =========================================

    function getCourse(courseId) {
        return courseList.find(
            (course) => course._id === courseId
        );
    }

    function getCourseName(courseId) {
        const course = getCourse(courseId);

        return course ? course.name : "Unknown Course";
    }

    // =========================================
    // ROLE-BASED ENROLLMENTS
    // =========================================

    const availableCourses = isAdmin
        ? courseList
        : courseList.filter(
            (course) => course.teacherId === user?.teacherId
        );

    const roleEnrollments = isAdmin
        ? enrollmentList
        : enrollmentList.filter((enrollment) =>
            availableCourses.some(
                (course) => course._id === enrollment.courseId
            )
        );

    // =========================================
    // SEARCH
    // =========================================

    const searchedEnrollments = roleEnrollments.filter((enrollment) => {
        const student = getStudent(enrollment.studentId);
        const course = getCourse(enrollment.courseId);

        const search = searchValue.trim().toLowerCase();

        const studentName = student
            ? `${student.firstName} ${student.lastName}`.toLowerCase()
            : "";

        return (
            enrollment._id?.toLowerCase().includes(search) ||
            enrollment.studentId?.toLowerCase().includes(search) ||
            studentName.includes(search) ||
            course?.name?.toLowerCase().includes(search) ||
            course?.code?.toLowerCase().includes(search)
        );
    });

    // =========================================
    // FILTER
    // =========================================

    const filteredEnrollments = searchedEnrollments.filter((enrollment) => {
        const course = getCourse(enrollment.courseId);

        const matchesCourse =
            !filterCourse || enrollment.courseId === filterCourse;

        const matchesGrade =
            !filterGrade || String(course?.gradeLevel) === filterGrade;

        const matchesStatus =
            !filterStatus || enrollment.status === filterStatus;

        return matchesCourse && matchesGrade && matchesStatus;
    });

    // =========================================
    // SORT
    // =========================================

    const sortedEnrollments = [...filteredEnrollments].sort((a, b) => {
        let valueA;
        let valueB;

        if (sortBy === "student") {
            valueA = getStudentName(a.studentId).toLowerCase();
            valueB = getStudentName(b.studentId).toLowerCase();
        } else if (sortBy === "course") {
            valueA = getCourseName(a.courseId).toLowerCase();
            valueB = getCourseName(b.courseId).toLowerCase();
        } else if (sortBy === "status") {
            valueA = String(a.status || "").toLowerCase();
            valueB = String(b.status || "").toLowerCase();
        } else if (sortBy === "id") {
            valueA = a._id;
            valueB = b._id;
        } else {
            valueA = a.enrollmentDate;
            valueB = b.enrollmentDate;
        }

        let result = 0;

        if (valueA < valueB) {
            result = -1;
        } else if (valueA > valueB) {
            result = 1;
        }

        return sortOrder === "asc" ? result : -result;
    });

    // =========================================
    // PAGINATION CALCULATIONS
    // =========================================

    const totalPages = Math.ceil(
        sortedEnrollments.length / recordsPerPage
    );

    const safeCurrentPage = Math.min(
        currentPage,
        Math.max(totalPages, 1)
    );

    const startIndex = (safeCurrentPage - 1) * recordsPerPage;

    const displayedEnrollments = sortedEnrollments.slice(
        startIndex,
        startIndex + recordsPerPage
    );

    // =========================================
    // SUMMARY INFORMATION
    // =========================================

    const totalEnrollments = roleEnrollments.length;

    const enrolledCount = roleEnrollments.filter(
        (enrollment) => enrollment.status === "Enrolled"
    ).length;

    const completedCount = roleEnrollments.filter(
        (enrollment) => enrollment.status === "Completed"
    ).length;

    const withdrawnCount = roleEnrollments.filter(
        (enrollment) => enrollment.status === "Withdrawn"
    ).length;

    // =========================================
    // OPEN ADD MODAL
    // =========================================

    function openAddModal() {
        if (!isAdmin) return;

        setEditingEnrollment(null);

        setFormData({
            studentId: "",
            courseId: "",
            enrollmentDate: new Date().toISOString().split("T")[0],
            status: "Enrolled"
        });

        setFormError("");
        setShowModal(true);
    }

    // =========================================
    // OPEN EDIT MODAL
    // =========================================

    function openEditModal(enrollment) {
        if (!isAdmin) return;

        setEditingEnrollment(enrollment);

        setFormData({
            studentId: enrollment.studentId,
            courseId: enrollment.courseId,
            enrollmentDate: enrollment.enrollmentDate,
            status: enrollment.status
        });

        setFormError("");
        setShowModal(true);
    }

    // =========================================
    // FORM INPUT HANDLER
    // =========================================

    function handleInputChange(event) {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));

        setFormError("");
    }

    // =========================================
    // GENERATE ENROLLMENT ID
    // =========================================

    function generateEnrollmentId() {
        const highestId = enrollmentList.reduce((highest, enrollment) => {
            const number = Number(
                String(enrollment._id).replace("ENR", "")
            );

            return number > highest ? number : highest;
        }, 0);

        return `ENR${String(highestId + 1).padStart(3, "0")}`;
    }

    // =========================================
    // FORM VALIDATION
    // =========================================

    function validateForm() {
        if (!formData.studentId) {
            return "Please select a student.";
        }

        if (!formData.courseId) {
            return "Please select a course.";
        }

        if (!formData.enrollmentDate) {
            return "Please select an enrollment date.";
        }

        if (!formData.status) {
            return "Please select an enrollment status.";
        }

        const duplicateEnrollment = enrollmentList.find((enrollment) => {
            return (
                enrollment.studentId === formData.studentId &&
                enrollment.courseId === formData.courseId &&
                enrollment._id !== editingEnrollment?._id
            );
        });

        if (duplicateEnrollment) {
            return "This student is already enrolled in this course.";
        }

        return "";
    }

    // =========================================
    // ADD OR UPDATE ENROLLMENT
    // =========================================

    function handleSubmit(event) {
        event.preventDefault();

        if (!isAdmin) return;

        const error = validateForm();

        if (error) {
            setFormError(error);
            return;
        }

        if (editingEnrollment) {
            const updatedEnrollment = {
                ...editingEnrollment,
                ...formData
            };

            const updatedEnrollments = enrollmentList.map((enrollment) =>
                enrollment._id === editingEnrollment._id
                    ? updatedEnrollment
                    : enrollment
            );

            saveEnrollments(updatedEnrollments);

            addNotification(
                "Enrollment Updated Successfully",
                `${getStudentName(updatedEnrollment.studentId)}'s enrollment has been updated successfully.`,
                "success"
            );
        } else {
            const newEnrollment = {
                _id: generateEnrollmentId(),
                ...formData
            };

            saveEnrollments([
                ...enrollmentList,
                newEnrollment
            ]);

            addNotification(
                "Enrollment Added Successfully",
                `${getStudentName(newEnrollment.studentId)} has been enrolled in ${getCourseName(newEnrollment.courseId)} successfully.`,
                "success"
            );
        }

        setShowModal(false);
        setEditingEnrollment(null);
        setFormError("");
        setCurrentPage(1);
    }

    // =========================================
    // DELETE ENROLLMENT
    // =========================================

    function handleDelete() {
        if (!isAdmin || !deleteEnrollment) return;

        const deletedStudentName = getStudentName(
            deleteEnrollment.studentId
        );

        const deletedCourseName = getCourseName(
            deleteEnrollment.courseId
        );

        const updatedEnrollments = enrollmentList.filter(
            (enrollment) => enrollment._id !== deleteEnrollment._id
        );

        saveEnrollments(updatedEnrollments);

        setDeleteEnrollment(null);

        addNotification(
            "Enrollment Deleted Successfully",
            `${deletedStudentName}'s enrollment in ${deletedCourseName} has been deleted.`,
            "success"
        );
    }

    // =========================================
    // CHANGE SORTING
    // =========================================

    function handleSortChange(value) {
        setSortBy(value);
        setCurrentPage(1);
    }

    // =========================================
    // RENDER
    // =========================================

    return (
        <MainLayout>
            <section className="enrollmentsPage">

                {/* Page Header */}
                <div className="enrollmentsPageHeader">
                    <div>
                        <h1>Enrollments</h1>
                        <p>Dashboard / Enrollments</p>
                    </div>

                    {isAdmin && (
                        <button onClick={openAddModal}>
                            + Add Enrollment
                        </button>
                    )}
                </div>

                {/* Summary Cards */}
                <div className="enrollmentSummaryCards">
                    <div className="enrollmentSummaryCard">
                        <h3>Total Enrollments</h3>
                        <p>{totalEnrollments}</p>
                    </div>

                    <div className="enrollmentSummaryCard">
                        <h3>Enrolled</h3>
                        <p>{enrolledCount}</p>
                    </div>

                    <div className="enrollmentSummaryCard">
                        <h3>Completed</h3>
                        <p>{completedCount}</p>
                    </div>

                    <div className="enrollmentSummaryCard">
                        <h3>Withdrawn</h3>
                        <p>{withdrawnCount}</p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="enrollmentFilters">
                    <input
                        type="text"
                        placeholder="Search by student, ID, or course..."
                        value={searchValue}
                        onChange={(event) => {
                            setSearchValue(event.target.value);
                            setCurrentPage(1);
                        }}
                    />

                    <select
                        value={filterCourse}
                        onChange={(event) => {
                            setFilterCourse(event.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="">All Courses</option>

                        {availableCourses.map((course) => (
                            <option
                                key={course._id}
                                value={course._id}
                            >
                                {course.name} ({course.code})
                            </option>
                        ))}
                    </select>

                    <select
                        value={filterGrade}
                        onChange={(event) => {
                            setFilterGrade(event.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="">All Grades</option>
                        <option value="9">Grade 9</option>
                        <option value="10">Grade 10</option>
                        <option value="11">Grade 11</option>
                        <option value="12">Grade 12</option>
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(event) => {
                            setFilterStatus(event.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="">All Statuses</option>
                        <option value="Enrolled">Enrolled</option>
                        <option value="Completed">Completed</option>
                        <option value="Withdrawn">Withdrawn</option>
                    </select>
                </div>

                {/* Sorting */}
                <div className="enrollmentSorting">
                    <label>Sort by:</label>

                    <select
                        value={sortBy}
                        onChange={(event) =>
                            handleSortChange(event.target.value)
                        }
                    >
                        <option value="enrollmentDate">Enrollment Date</option>
                        <option value="student">Student Name</option>
                        <option value="course">Course Name</option>
                        <option value="status">Status</option>
                        <option value="id">Enrollment ID</option>
                    </select>

                    <button
                        onClick={() => {
                            setSortOrder(
                                sortOrder === "asc" ? "desc" : "asc"
                            );
                        }}
                    >
                        {sortOrder === "asc"
                            ? "Ascending ↑"
                            : "Descending ↓"}
                    </button>
                </div>

                {/* Enrollment Table */}
                <div className="enrollmentTableContainer">
                    <table>
                        <thead>
                            <tr>
                                <th>Enrollment ID</th>
                                <th>Student</th>
                                <th>Course</th>
                                <th>Grade</th>
                                <th>Enrollment Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {displayedEnrollments.length === 0 ? (
                                <tr>
                                    <td colSpan="7">
                                        No enrollments found.
                                    </td>
                                </tr>
                            ) : (
                                displayedEnrollments.map((enrollment) => {
                                    const student = getStudent(
                                        enrollment.studentId
                                    );

                                    const course = getCourse(
                                        enrollment.courseId
                                    );

                                    return (
                                        <tr key={enrollment._id}>
                                            <td>{enrollment._id}</td>

                                            <td>
                                                {student ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/students/${student._id}`
                                                            )
                                                        }
                                                    >
                                                        {getStudentName(
                                                            enrollment.studentId
                                                        )}
                                                    </button>
                                                ) : (
                                                    "Unknown Student"
                                                )}
                                            </td>

                                            <td>
                                                {course ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/courses/${course._id}`
                                                            )
                                                        }
                                                    >
                                                        {course.name}
                                                    </button>
                                                ) : (
                                                    "Unknown Course"
                                                )}
                                            </td>

                                            <td>
                                                {course
                                                    ? `Grade ${course.gradeLevel}`
                                                    : "-"}
                                            </td>

                                            <td>
                                                {enrollment.enrollmentDate}
                                            </td>

                                            <td>
                                                <span
                                                    className={`enrollmentStatus ${String(enrollment.status || "").toLowerCase()}`}
                                                >
                                                    {enrollment.status}
                                                </span>
                                            </td>

                                            <td>
                                                {isAdmin ? (
                                                    <>
                                                        <button
                                                            onClick={() =>
                                                                openEditModal(enrollment)
                                                            }
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                setDeleteEnrollment(enrollment)
                                                            }
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() =>
                                                            navigate(
                                                                `/students/${enrollment.studentId}`
                                                            )
                                                        }
                                                    >
                                                        View Student
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="enrollmentPagination">
                    <p>
                        Showing{" "}
                        {sortedEnrollments.length === 0
                            ? 0
                            : startIndex + 1}
                        {" - "}
                        {Math.min(
                            startIndex + recordsPerPage,
                            sortedEnrollments.length
                        )}
                        {" of "}
                        {sortedEnrollments.length} enrollments
                    </p>

                    <div>
                        <button
                            disabled={safeCurrentPage === 1}
                            onClick={() =>
                                setCurrentPage(safeCurrentPage - 1)
                            }
                        >
                            Previous
                        </button>

                        <span>
                            Page {safeCurrentPage} of {Math.max(totalPages, 1)}
                        </span>

                        <button
                            disabled={
                                safeCurrentPage >= Math.max(totalPages, 1)
                            }
                            onClick={() =>
                                setCurrentPage(safeCurrentPage + 1)
                            }
                        >
                            Next
                        </button>
                    </div>
                </div>

                {/* Add / Edit Enrollment Modal */}
                {showModal && (
                    <div className="modalOverlay">
                        <div className="enrollmentModal">
                            <h2>
                                {editingEnrollment
                                    ? "Edit Enrollment"
                                    : "Add Enrollment"}
                            </h2>

                            <form onSubmit={handleSubmit}>
                                <div>
                                    <label>Student</label>

                                    <select
                                        name="studentId"
                                        value={formData.studentId}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">
                                            Select Student
                                        </option>

                                        {studentList.map((student) => (
                                            <option
                                                key={student._id}
                                                value={student._id}
                                            >
                                                {student.firstName}{" "}
                                                {student.lastName}
                                                {" - "}
                                                {student._id}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label>Course</label>

                                    <select
                                        name="courseId"
                                        value={formData.courseId}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">
                                            Select Course
                                        </option>

                                        {availableCourses.map((course) => (
                                            <option
                                                key={course._id}
                                                value={course._id}
                                            >
                                                {course.name} - {course.code}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label>Enrollment Date</label>

                                    <input
                                        type="date"
                                        name="enrollmentDate"
                                        value={formData.enrollmentDate}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div>
                                    <label>Status</label>

                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Enrolled">Enrolled</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Withdrawn">Withdrawn</option>
                                    </select>
                                </div>

                                {formError && (
                                    <p className="formError">
                                        {formError}
                                    </p>
                                )}

                                <div className="enrollmentModalActions">
                                    <button type="submit">
                                        {editingEnrollment
                                            ? "Update Enrollment"
                                            : "Add Enrollment"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setFormError("");
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Popup */}
                {deleteEnrollment && (
                    <div className="modalOverlay">
                        <div className="deleteConfirmationModal">
                            <h2>Delete Enrollment?</h2>

                            <p>
                                Are you sure you want to delete enrollment{" "}
                                <strong>{deleteEnrollment._id}</strong>?
                            </p>

                            <p>This action cannot be undone.</p>

                            <div>
                                <button onClick={handleDelete}>
                                    Yes, Delete
                                </button>

                                <button
                                    onClick={() => setDeleteEnrollment(null)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </section>
        </MainLayout>
    );
}
