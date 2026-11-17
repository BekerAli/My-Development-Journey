
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

import MainLayout from "../components/layout/MainLayout";

import {
    students,
    courses,
    attendance
} from "../data/mockData";

import "../styles/Attendance.css";

export default function Attendance() {
    const { user } = useAuth();
    const { addNotification } = useNotifications();
    const navigate = useNavigate();

    const isAdmin = user?.role === "Admin";
    const isTeacher = user?.role === "Teacher";

    // =========================================
    // LOAD DATA
    // =========================================

    const [attendanceList, setAttendanceList] = useState(() => {
        try {
            const saved = localStorage.getItem("eduTrackAttendance");
            return saved ? JSON.parse(saved) : attendance;
        } catch {
            return attendance;
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
    const [filterDate, setFilterDate] = useState("");

    // =========================================
    // SORTING STATES
    // =========================================

    const [sortBy, setSortBy] = useState("date");
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
    const [editingAttendance, setEditingAttendance] = useState(null);
    const [deleteAttendance, setDeleteAttendance] = useState(null);

    // =========================================
    // FORM STATES
    // =========================================

    const [formData, setFormData] = useState({
        studentId: "",
        courseId: "",
        date: new Date().toISOString().split("T")[0],
        status: "Present",
        remarks: ""
    });

    const [formError, setFormError] = useState("");

    // =========================================
    // SAVE ATTENDANCE RECORDS
    // =========================================

    function saveAttendance(updatedAttendance) {
        setAttendanceList(updatedAttendance);

        localStorage.setItem(
            "eduTrackAttendance",
            JSON.stringify(updatedAttendance)
        );
    }

    // =========================================
    // STUDENT INFORMATION
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
    // COURSE INFORMATION
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
    // ROLE-BASED COURSES AND ATTENDANCE
    // =========================================

    const availableCourses = isAdmin
        ? courseList
        : courseList.filter(
            (course) => course.teacherId === user?.teacherId
        );

    const roleAttendance = isAdmin
        ? attendanceList
        : attendanceList.filter((record) =>
            availableCourses.some(
                (course) => course._id === record.courseId
            )
        );

    // =========================================
    // SEARCH ATTENDANCE
    // =========================================

    const searchedAttendance = roleAttendance.filter((record) => {
        const student = getStudent(record.studentId);
        const course = getCourse(record.courseId);

        const search = searchValue.trim().toLowerCase();

        const studentName = student
            ? `${student.firstName} ${student.lastName}`.toLowerCase()
            : "";

        return (
            record._id?.toLowerCase().includes(search) ||
            record.studentId?.toLowerCase().includes(search) ||
            studentName.includes(search) ||
            course?.name?.toLowerCase().includes(search) ||
            course?.code?.toLowerCase().includes(search)
        );
    });

    // =========================================
    // FILTER ATTENDANCE
    // =========================================

    const filteredAttendance = searchedAttendance.filter((record) => {
        const course = getCourse(record.courseId);

        const matchesCourse =
            !filterCourse || record.courseId === filterCourse;

        const matchesGrade =
            !filterGrade ||
            String(course?.gradeLevel) === filterGrade;

        const matchesStatus =
            !filterStatus || record.status === filterStatus;

        const matchesDate =
            !filterDate || record.date === filterDate;

        return (
            matchesCourse &&
            matchesGrade &&
            matchesStatus &&
            matchesDate
        );
    });

    // =========================================
    // SORT ATTENDANCE
    // =========================================

    const sortedAttendance = [...filteredAttendance].sort((a, b) => {
        let valueA;
        let valueB;

        if (sortBy === "student") {
            valueA = getStudentName(a.studentId).toLowerCase();
            valueB = getStudentName(b.studentId).toLowerCase();
        } else if (sortBy === "course") {
            valueA = getCourseName(a.courseId).toLowerCase();
            valueB = getCourseName(b.courseId).toLowerCase();
        } else if (sortBy === "status") {
            valueA = (a.status || "").toLowerCase();
            valueB = (b.status || "").toLowerCase();
        } else if (sortBy === "id") {
            valueA = a._id || "";
            valueB = b._id || "";
        } else {
            valueA = a.date || "";
            valueB = b.date || "";
        }

        let result = 0;

        if (valueA < valueB) result = -1;
        if (valueA > valueB) result = 1;

        return sortOrder === "asc" ? result : -result;
    });

    // =========================================
    // PAGINATION CALCULATIONS
    // =========================================

    const totalPages = Math.ceil(
        sortedAttendance.length / recordsPerPage
    );

    const safeCurrentPage = Math.min(
        currentPage,
        Math.max(totalPages, 1)
    );

    const startIndex = (safeCurrentPage - 1) * recordsPerPage;

    const displayedAttendance = sortedAttendance.slice(
        startIndex,
        startIndex + recordsPerPage
    );

    // =========================================
    // SUMMARY CARDS
    // =========================================

    const totalAttendance = roleAttendance.length;

    const presentCount = roleAttendance.filter(
        (record) => record.status === "Present"
    ).length;

    const absentCount = roleAttendance.filter(
        (record) => record.status === "Absent"
    ).length;

    const lateCount = roleAttendance.filter(
        (record) => record.status === "Late"
    ).length;

    // =========================================
    // OPEN ADD MODAL
    // =========================================

    function openAddModal() {
        setEditingAttendance(null);

        setFormData({
            studentId: "",
            courseId: "",
            date: new Date().toISOString().split("T")[0],
            status: "Present",
            remarks: ""
        });

        setFormError("");
        setShowModal(true);
    }

    // =========================================
    // OPEN EDIT MODAL
    // =========================================

    function openEditModal(record) {
        setEditingAttendance(record);

        setFormData({
            studentId: record.studentId,
            courseId: record.courseId,
            date: record.date,
            status: record.status,
            remarks: record.remarks || ""
        });

        setFormError("");
        setShowModal(true);
    }

    // =========================================
    // HANDLE FORM INPUTS
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
    // GENERATE ATTENDANCE ID
    // =========================================

    function generateAttendanceId() {
        const highestId = attendanceList.reduce((highest, record) => {
            const number = Number(
                String(record._id || "").replace("ATT", "")
            );

            return number > highest ? number : highest;
        }, 0);

        return `ATT${String(highestId + 1).padStart(4, "0")}`;
    }

    // =========================================
    // VALIDATE FORM
    // =========================================

    function validateForm() {
        if (!formData.studentId) {
            return "Please select a student.";
        }

        if (!formData.courseId) {
            return "Please select a course.";
        }

        if (!formData.date) {
            return "Please select an attendance date.";
        }

        if (!formData.status) {
            return "Please select an attendance status.";
        }

        const duplicateRecord = attendanceList.find((record) => {
            return (
                record.studentId === formData.studentId &&
                record.courseId === formData.courseId &&
                record.date === formData.date &&
                record._id !== editingAttendance?._id
            );
        });

        if (duplicateRecord) {
            return "Attendance for this student and course has already been recorded on this date.";
        }

        return "";
    }

    // =========================================
    // ADD OR UPDATE ATTENDANCE
    // =========================================

    function handleSubmit(event) {
        event.preventDefault();

        const error = validateForm();

        if (error) {
            setFormError(error);
            return;
        }

        const currentTime = new Date().toISOString();

        if (editingAttendance) {
            const updatedAttendance = attendanceList.map((record) =>
                record._id === editingAttendance._id
                    ? {
                        ...record,
                        ...formData,
                        updatedAt: currentTime
                    }
                    : record
            );

            saveAttendance(updatedAttendance);

            addNotification(
                "Attendance Updated Successfully",
                `${getStudentName(formData.studentId)}'s attendance has been updated successfully.`,
                "success"
            );
        } else {
            const newAttendance = {
                _id: generateAttendanceId(),
                ...formData,
                createdAt: currentTime,
                updatedAt: currentTime
            };

            saveAttendance([
                ...attendanceList,
                newAttendance
            ]);

            addNotification(
                "Attendance Recorded Successfully",
                `${getStudentName(formData.studentId)}'s attendance has been recorded as ${formData.status}.`,
                "success"
            );
        }

        setShowModal(false);
        setEditingAttendance(null);
        setFormError("");
        setCurrentPage(1);
    }

    // =========================================
    // DELETE ATTENDANCE
    // =========================================

    function handleDelete() {
        if (!deleteAttendance) return;

        const deletedRecordId = deleteAttendance._id;
        const deletedStudentName = getStudentName(
            deleteAttendance.studentId
        );

        const updatedAttendance = attendanceList.filter(
            (record) => record._id !== deletedRecordId
        );

        saveAttendance(updatedAttendance);
        setDeleteAttendance(null);

        addNotification(
            "Attendance Deleted Successfully",
            `${deletedStudentName}'s attendance record (${deletedRecordId}) has been deleted.`,
            "success"
        );
    }

    // =========================================
    // CLEAR FILTERS
    // =========================================

    function clearFilters() {
        setSearchValue("");
        setFilterCourse("");
        setFilterGrade("");
        setFilterStatus("");
        setFilterDate("");
        setCurrentPage(1);
    }

    // =========================================
    // RENDER
    // =========================================

    return (
        <MainLayout>
            <section className="attendancePage">

                {/* Page Header */}
                <div className="attendancePageHeader">
                    <div>
                        <h1>Attendance</h1>
                        <p>Dashboard / Attendance</p>
                    </div>

                    {(isAdmin || isTeacher) && (
                        <button onClick={openAddModal}>
                            + Record Attendance
                        </button>
                    )}
                </div>

                {/* Summary Cards */}
                <div className="attendanceSummaryCards">
                    <div className="attendanceSummaryCard">
                        <h3>Total Records</h3>
                        <p>{totalAttendance}</p>
                    </div>

                    <div className="attendanceSummaryCard">
                        <h3>Present</h3>
                        <p>{presentCount}</p>
                    </div>

                    <div className="attendanceSummaryCard">
                        <h3>Absent</h3>
                        <p>{absentCount}</p>
                    </div>

                    <div className="attendanceSummaryCard">
                        <h3>Late</h3>
                        <p>{lateCount}</p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="attendanceFilters">
                    <input
                        type="text"
                        placeholder="Search student, ID, or course..."
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
                            <option key={course._id} value={course._id}>
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
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Late">Late</option>
                    </select>

                    <input
                        type="date"
                        value={filterDate}
                        onChange={(event) => {
                            setFilterDate(event.target.value);
                            setCurrentPage(1);
                        }}
                    />

                    <button type="button" onClick={clearFilters}>
                        Clear Filters
                    </button>
                </div>

                {/* Sorting */}
                <div className="attendanceSorting">
                    <label>Sort by:</label>

                    <select
                        value={sortBy}
                        onChange={(event) => {
                            setSortBy(event.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="date">Date</option>
                        <option value="student">Student Name</option>
                        <option value="course">Course Name</option>
                        <option value="status">Status</option>
                        <option value="id">Attendance ID</option>
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

                {/* Attendance Table */}
                <div className="attendanceTableContainer">
                    <table>
                        <thead>
                            <tr>
                                <th>Attendance ID</th>
                                <th>Student</th>
                                <th>Course</th>
                                <th>Grade</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Remarks</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {displayedAttendance.length === 0 ? (
                                <tr>
                                    <td colSpan="8">
                                        No attendance records found.
                                    </td>
                                </tr>
                            ) : (
                                displayedAttendance.map((record) => {
                                    const student = getStudent(record.studentId);
                                    const course = getCourse(record.courseId);

                                    return (
                                        <tr key={record._id}>
                                            <td>{record._id}</td>

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
                                                        {getStudentName(record.studentId)}
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

                                            <td>{record.date}</td>

                                            <td>
                                                <span
                                                    className={`attendanceStatus ${(record.status || "").toLowerCase()}`}
                                                >
                                                    {record.status}
                                                </span>
                                            </td>

                                            <td>{record.remarks || "-"}</td>

                                            <td>
                                                {(isAdmin || isTeacher) && (
                                                    <>
                                                        <button
                                                            onClick={() =>
                                                                openEditModal(record)
                                                            }
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                setDeleteAttendance(record)
                                                            }
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
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
                <div className="attendancePagination">
                    <p>
                        Showing{" "}
                        {sortedAttendance.length === 0
                            ? 0
                            : startIndex + 1}
                        {" - "}
                        {Math.min(
                            startIndex + recordsPerPage,
                            sortedAttendance.length
                        )}
                        {" of "}
                        {sortedAttendance.length} records
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
                            Page {safeCurrentPage} of{" "}
                            {Math.max(totalPages, 1)}
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

                {/* Add / Edit Attendance Modal */}
                {showModal && (
                    <div className="modalOverlay">
                        <div className="attendanceModal">
                            <h2>
                                {editingAttendance
                                    ? "Edit Attendance"
                                    : "Record Attendance"}
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
                                    <label>Attendance Date</label>

                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
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
                                        <option value="Present">Present</option>
                                        <option value="Absent">Absent</option>
                                        <option value="Late">Late</option>
                                    </select>
                                </div>

                                <div className="attendanceRemarksField">
                                    <label>Remarks</label>

                                    <textarea
                                        name="remarks"
                                        value={formData.remarks}
                                        onChange={handleInputChange}
                                        placeholder="Enter remarks (optional)"
                                        rows="3"
                                    />
                                </div>

                                {formError && (
                                    <p className="formError">
                                        {formError}
                                    </p>
                                )}

                                <div className="attendanceModalActions">
                                    <button type="submit">
                                        {editingAttendance
                                            ? "Update Attendance"
                                            : "Save Attendance"}
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
                {deleteAttendance && (
                    <div className="modalOverlay">
                        <div className="deleteConfirmationModal">
                            <h2>Delete Attendance Record?</h2>

                            <p>
                                Are you sure you want to delete attendance record{" "}
                                <strong>{deleteAttendance._id}</strong>?
                            </p>

                            <p>This action cannot be undone.</p>

                            <div>
                                <button onClick={handleDelete}>
                                    Yes, Delete
                                </button>

                                <button
                                    onClick={() => setDeleteAttendance(null)}
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
