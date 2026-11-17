
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import MainLayout from "../components/layout/MainLayout";

import {
    students,
    courses,
    enrollments,
    grades
} from "../data/mockData";

import "../styles/Grades.css";

export default function Grades() {
    const { user } = useAuth();
    const { addNotification } = useNotifications();
    const navigate = useNavigate();

    const isAdmin = user?.role === "Admin";
    const isTeacher = user?.role === "Teacher";

    // =========================================
    // LOAD GRADES
    // =========================================

    const [gradeList, setGradeList] = useState(() => {
        try {
            const saved = localStorage.getItem("eduTrackGrades");
            return saved ? JSON.parse(saved) : grades;
        } catch {
            return grades;
        }
    });

    // =========================================
    // LOAD STUDENTS
    // =========================================

    const [studentList] = useState(() => {
        try {
            const saved = localStorage.getItem("eduTrackStudents");
            return saved ? JSON.parse(saved) : students;
        } catch {
            return students;
        }
    });

    // =========================================
    // LOAD COURSES
    // =========================================

    const [courseList] = useState(() => {
        try {
            const saved = localStorage.getItem("eduTrackCourses");
            return saved ? JSON.parse(saved) : courses;
        } catch {
            return courses;
        }
    });

    // =========================================
    // LOAD ENROLLMENTS
    // =========================================

    const [enrollmentList] = useState(() => {
        try {
            const saved = localStorage.getItem("eduTrackEnrollments");
            return saved ? JSON.parse(saved) : enrollments;
        } catch {
            return enrollments;
        }
    });

    // =========================================
    // SEARCH AND FILTERS
    // =========================================

    const [searchValue, setSearchValue] = useState("");
    const [filterCourse, setFilterCourse] = useState("");
    const [filterGrade, setFilterGrade] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterTerm, setFilterTerm] = useState("");

    // =========================================
    // SORTING
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
    const [editingGrade, setEditingGrade] = useState(null);
    const [deleteGrade, setDeleteGrade] = useState(null);

    // =========================================
    // FORM STATES
    // =========================================

    const [formData, setFormData] = useState({
        studentId: "",
        courseId: "",
        assessmentName: "",
        assessmentType: "Quiz",
        score: "",
        maxScore: "",
        term: "First Term",
        date: new Date().toISOString().split("T")[0],
        remarks: ""
    });

    const [formError, setFormError] = useState("");

    // =========================================
    // SAVE GRADES
    // =========================================

    function saveGrades(updatedGrades) {
        setGradeList(updatedGrades);

        localStorage.setItem(
            "eduTrackGrades",
            JSON.stringify(updatedGrades)
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
    // ROLE-BASED COURSES AND GRADES
    // =========================================

    const availableCourses = isAdmin
        ? courseList
        : courseList.filter(
            (course) => course.teacherId === user?.teacherId
        );

    const roleGrades = isAdmin
        ? gradeList
        : gradeList.filter((grade) =>
            availableCourses.some(
                (course) => course._id === grade.courseId
            )
        );

    // =========================================
    // ELIGIBLE STUDENTS
    // =========================================

    function getEligibleStudents(courseId) {
        if (!courseId) return [];

        const enrolledStudentIds = enrollmentList
            .filter(
                (enrollment) =>
                    enrollment.courseId === courseId &&
                    enrollment.status !== "Withdrawn"
            )
            .map((enrollment) => enrollment.studentId);

        return studentList.filter((student) =>
            enrolledStudentIds.includes(student._id)
        );
    }

    // =========================================
    // SEARCH GRADES
    // =========================================

    const searchedGrades = roleGrades.filter((grade) => {
        const student = getStudent(grade.studentId);
        const course = getCourse(grade.courseId);

        const search = searchValue.trim().toLowerCase();

        const studentName = student
            ? `${student.firstName} ${student.lastName}`.toLowerCase()
            : "";

        return (
            grade._id?.toLowerCase().includes(search) ||
            grade.studentId?.toLowerCase().includes(search) ||
            studentName.includes(search) ||
            grade.assessmentName?.toLowerCase().includes(search) ||
            grade.assessmentType?.toLowerCase().includes(search) ||
            course?.name?.toLowerCase().includes(search) ||
            course?.code?.toLowerCase().includes(search)
        );
    });

    // =========================================
    // FILTER GRADES
    // =========================================

    const filteredGrades = searchedGrades.filter((grade) => {
        const course = getCourse(grade.courseId);

        const matchesCourse =
            !filterCourse || grade.courseId === filterCourse;

        const matchesGrade =
            !filterGrade ||
            String(course?.gradeLevel) === filterGrade;

        const matchesType =
            !filterType || grade.assessmentType === filterType;

        const matchesTerm =
            !filterTerm || grade.term === filterTerm;

        return (
            matchesCourse &&
            matchesGrade &&
            matchesType &&
            matchesTerm
        );
    });

    // =========================================
    // SORT GRADES
    // =========================================

    const sortedGrades = [...filteredGrades].sort((a, b) => {
        let valueA;
        let valueB;

        if (sortBy === "student") {
            valueA = getStudentName(a.studentId).toLowerCase();
            valueB = getStudentName(b.studentId).toLowerCase();
        } else if (sortBy === "course") {
            valueA = getCourseName(a.courseId).toLowerCase();
            valueB = getCourseName(b.courseId).toLowerCase();
        } else if (sortBy === "assessment") {
            valueA = (a.assessmentName || "").toLowerCase();
            valueB = (b.assessmentName || "").toLowerCase();
        } else if (sortBy === "score") {
            valueA = Number(a.maxScore) > 0
                ? Number(a.score) / Number(a.maxScore)
                : 0;

            valueB = Number(b.maxScore) > 0
                ? Number(b.score) / Number(b.maxScore)
                : 0;
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
        sortedGrades.length / recordsPerPage
    );

    const safeCurrentPage = Math.min(
        currentPage,
        Math.max(totalPages, 1)
    );

    const startIndex = (safeCurrentPage - 1) * recordsPerPage;

    const displayedGrades = sortedGrades.slice(
        startIndex,
        startIndex + recordsPerPage
    );

    // =========================================
    // GRADE PERCENTAGE
    // =========================================

    function getPercentage(score, maxScore) {
        if (Number(maxScore) <= 0) return "0.0";

        return (
            (Number(score) / Number(maxScore)) * 100
        ).toFixed(1);
    }

    // =========================================
    // SUMMARY CALCULATIONS
    // =========================================

    const totalGrades = roleGrades.length;

    const averageGrade = totalGrades > 0
        ? (
            roleGrades.reduce((total, grade) => {
                const maxScore = Number(grade.maxScore);

                const percentage = maxScore > 0
                    ? (Number(grade.score) / maxScore) * 100
                    : 0;

                return total + percentage;
            }, 0) / totalGrades
        ).toFixed(1)
        : "0.0";

    const highestGrade = totalGrades > 0
        ? Math.max(
            ...roleGrades.map((grade) => {
                const maxScore = Number(grade.maxScore);

                return maxScore > 0
                    ? (Number(grade.score) / maxScore) * 100
                    : 0;
            })
        ).toFixed(1)
        : "0.0";

    const passingGrades = roleGrades.filter((grade) => {
        const maxScore = Number(grade.maxScore);

        return maxScore > 0 &&
            (Number(grade.score) / maxScore) * 100 >= 50;
    }).length;

    // =========================================
    // AVAILABLE TERMS
    // =========================================

    const availableTerms = [
        ...new Set(
            gradeList.map((grade) => grade.term).filter(Boolean)
        )
    ];

    // =========================================
    // OPEN ADD MODAL
    // =========================================

    function openAddModal() {
        setEditingGrade(null);

        setFormData({
            studentId: "",
            courseId: "",
            assessmentName: "",
            assessmentType: "Quiz",
            score: "",
            maxScore: "",
            term: availableTerms[0] || "First Term",
            date: new Date().toISOString().split("T")[0],
            remarks: ""
        });

        setFormError("");
        setShowModal(true);
    }

    // =========================================
    // OPEN EDIT MODAL
    // =========================================

    function openEditModal(grade) {
        setEditingGrade(grade);

        setFormData({
            studentId: grade.studentId,
            courseId: grade.courseId,
            assessmentName: grade.assessmentName,
            assessmentType: grade.assessmentType,
            score: String(grade.score),
            maxScore: String(grade.maxScore),
            term: grade.term,
            date: grade.date,
            remarks: grade.remarks || ""
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
            [name]: value,
            ...(name === "courseId" ? { studentId: "" } : {})
        }));

        setFormError("");
    }

    // =========================================
    // GENERATE GRADE ID
    // =========================================

    function generateGradeId() {
        const highestId = gradeList.reduce((highest, grade) => {
            const number = Number(
                String(grade._id || "").replace("GRD", "")
            );

            return number > highest ? number : highest;
        }, 0);

        return `GRD${String(highestId + 1).padStart(4, "0")}`;
    }

    // =========================================
    // VALIDATE FORM
    // =========================================

    function validateForm() {
        if (!formData.courseId) {
            return "Please select a course.";
        }

        if (!formData.studentId) {
            return "Please select a student.";
        }

        if (!formData.assessmentName.trim()) {
            return "Assessment name is required.";
        }

        if (!formData.assessmentType) {
            return "Please select an assessment type.";
        }

        if (!formData.term.trim()) {
            return "Term is required.";
        }

        if (!formData.date) {
            return "Please select an assessment date.";
        }

        if (
            formData.score === "" ||
            formData.maxScore === ""
        ) {
            return "Score and maximum score are required.";
        }

        const score = Number(formData.score);
        const maxScore = Number(formData.maxScore);

        if (
            !Number.isFinite(score) ||
            !Number.isFinite(maxScore)
        ) {
            return "Please enter valid numeric scores.";
        }

        if (score < 0) {
            return "Score cannot be negative.";
        }

        if (maxScore <= 0) {
            return "Maximum score must be greater than zero.";
        }

        if (score > maxScore) {
            return "Score cannot exceed the maximum score.";
        }

        const eligibleStudents = getEligibleStudents(
            formData.courseId
        );

        const studentIsEnrolled = eligibleStudents.some(
            (student) => student._id === formData.studentId
        );

        const isExistingStudentCourse =
            editingGrade &&
            editingGrade.studentId === formData.studentId &&
            editingGrade.courseId === formData.courseId;

        if (!studentIsEnrolled && !isExistingStudentCourse) {
            return "This student is not enrolled in the selected course.";
        }

        const duplicateGrade = gradeList.find((grade) => {
            return (
                grade.studentId === formData.studentId &&
                grade.courseId === formData.courseId &&
                (grade.assessmentName || "").trim().toLowerCase() ===
                    formData.assessmentName.trim().toLowerCase() &&
                grade.assessmentType === formData.assessmentType &&
                grade.term === formData.term &&
                grade._id !== editingGrade?._id
            );
        });

        if (duplicateGrade) {
            return "This assessment has already been recorded for this student.";
        }

        return "";
    }

    // =========================================
    // ADD OR UPDATE GRADE
    // =========================================

    function handleSubmit(event) {
        event.preventDefault();

        const error = validateForm();

        if (error) {
            setFormError(error);
            return;
        }

        const currentTime = new Date().toISOString();

        const gradeData = {
            ...formData,
            assessmentName: formData.assessmentName.trim(),
            score: Number(formData.score),
            maxScore: Number(formData.maxScore),
            term: formData.term.trim()
        };

        if (editingGrade) {
            const updatedGrades = gradeList.map((grade) =>
                grade._id === editingGrade._id
                    ? {
                        ...grade,
                        ...gradeData,
                        updatedAt: currentTime
                    }
                    : grade
            );

            saveGrades(updatedGrades);

            addNotification(
                "Grade Updated Successfully",
                `${getStudentName(gradeData.studentId)}'s ${gradeData.assessmentName} grade has been updated.`,
                "success"
            );
        } else {
            const newGrade = {
                _id: generateGradeId(),
                ...gradeData,
                createdAt: currentTime,
                updatedAt: currentTime
            };

            saveGrades([
                ...gradeList,
                newGrade
            ]);

            addNotification(
                "Grade Added Successfully",
                `${gradeData.assessmentName} grade has been recorded for ${getStudentName(gradeData.studentId)}.`,
                "success"
            );
        }

        setShowModal(false);
        setEditingGrade(null);
        setFormError("");
        setCurrentPage(1);
    }

    // =========================================
    // DELETE GRADE
    // =========================================

    function handleDelete() {
        if (!deleteGrade) return;

        const deletedGradeId = deleteGrade._id;
        const deletedStudentName = getStudentName(
            deleteGrade.studentId
        );
        const deletedAssessmentName = deleteGrade.assessmentName;

        const updatedGrades = gradeList.filter(
            (grade) => grade._id !== deletedGradeId
        );

        saveGrades(updatedGrades);
        setDeleteGrade(null);

        addNotification(
            "Grade Deleted Successfully",
            `${deletedAssessmentName} grade for ${deletedStudentName} has been deleted.`,
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
        setFilterType("");
        setFilterTerm("");
        setCurrentPage(1);
    }

    // =========================================
    // RENDER
    // =========================================

    return (
        <MainLayout>
            <section className="gradesPage">

                {/* Page Header */}
                <div className="gradesPageHeader">
                    <div>
                        <h1>Grades</h1>
                        <p>Dashboard / Grades</p>
                    </div>

                    {(isAdmin || isTeacher) && (
                        <button onClick={openAddModal}>
                            + Add Grade
                        </button>
                    )}
                </div>

                {/* Summary Cards */}
                <div className="gradesSummaryCards">
                    <div className="gradesSummaryCard">
                        <h3>Total Assessments</h3>
                        <p>{totalGrades}</p>
                    </div>

                    <div className="gradesSummaryCard">
                        <h3>Average Score</h3>
                        <p>{averageGrade}%</p>
                    </div>

                    <div className="gradesSummaryCard">
                        <h3>Highest Score</h3>
                        <p>{highestGrade}%</p>
                    </div>

                    <div className="gradesSummaryCard">
                        <h3>Passing Results</h3>
                        <p>{passingGrades}</p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="gradesFilters">
                    <input
                        type="text"
                        placeholder="Search student, assessment, or course..."
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
                        value={filterType}
                        onChange={(event) => {
                            setFilterType(event.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="">All Assessment Types</option>
                        <option value="Quiz">Quiz</option>
                        <option value="Assignment">Assignment</option>
                        <option value="Exam">Exam</option>
                        <option value="Project">Project</option>
                    </select>

                    <select
                        value={filterTerm}
                        onChange={(event) => {
                            setFilterTerm(event.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="">All Terms</option>

                        {availableTerms.map((term) => (
                            <option key={term} value={term}>
                                {term}
                            </option>
                        ))}
                    </select>

                    <button
                        type="button"
                        onClick={clearFilters}
                    >
                        Clear Filters
                    </button>
                </div>

                {/* Sorting */}
                <div className="gradesSorting">
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
                        <option value="assessment">Assessment</option>
                        <option value="score">Score Percentage</option>
                        <option value="id">Grade ID</option>
                    </select>

                    <button
                        type="button"
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

                {/* Grades Table */}
                <div className="gradesTableContainer">
                    <table>
                        <thead>
                            <tr>
                                <th>Grade ID</th>
                                <th>Student</th>
                                <th>Course</th>
                                <th>Assessment</th>
                                <th>Type</th>
                                <th>Score</th>
                                <th>Percentage</th>
                                <th>Term</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {displayedGrades.length === 0 ? (
                                <tr>
                                    <td colSpan="10">
                                        No grade records found.
                                    </td>
                                </tr>
                            ) : (
                                displayedGrades.map((grade) => {
                                    const student = getStudent(
                                        grade.studentId
                                    );

                                    const course = getCourse(
                                        grade.courseId
                                    );

                                    return (
                                        <tr key={grade._id}>
                                            <td>{grade._id}</td>

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
                                                            grade.studentId
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

                                            <td>{grade.assessmentName}</td>
                                            <td>{grade.assessmentType}</td>

                                            <td>
                                                {grade.score} / {grade.maxScore}
                                            </td>

                                            <td>
                                                {getPercentage(
                                                    grade.score,
                                                    grade.maxScore
                                                )}%
                                            </td>

                                            <td>{grade.term}</td>
                                            <td>{grade.date}</td>

                                            <td>
                                                {(isAdmin || isTeacher) && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEditModal(grade)
                                                            }
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setDeleteGrade(grade)
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
                <div className="gradesPagination">
                    <p>
                        Showing{" "}
                        {sortedGrades.length === 0
                            ? 0
                            : startIndex + 1}
                        {" - "}
                        {Math.min(
                            startIndex + recordsPerPage,
                            sortedGrades.length
                        )}
                        {" of "}
                        {sortedGrades.length} records
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

            </section>

            {/* Add / Edit Grade Modal */}
            {showModal && (
                <div className="modalOverlay">
                    <div className="gradesModal">
                        <h2>
                            {editingGrade ? "Edit Grade" : "Add Grade"}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div>
                                <label>Course</label>

                                <select
                                    name="courseId"
                                    value={formData.courseId}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Course</option>

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
                                <label>Student</label>

                                <select
                                    name="studentId"
                                    value={formData.studentId}
                                    onChange={handleInputChange}
                                    disabled={!formData.courseId}
                                >
                                    <option value="">
                                        {formData.courseId
                                            ? "Select Student"
                                            : "Select a course first"}
                                    </option>

                                    {getEligibleStudents(
                                        formData.courseId
                                    ).map((student) => (
                                        <option
                                            key={student._id}
                                            value={student._id}
                                        >
                                            {student.firstName} {student.lastName}
                                            {" - "}
                                            {student._id}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label>Assessment Name</label>

                                <input
                                    type="text"
                                    name="assessmentName"
                                    value={formData.assessmentName}
                                    onChange={handleInputChange}
                                    placeholder="Example: Quiz 1"
                                />
                            </div>

                            <div>
                                <label>Assessment Type</label>

                                <select
                                    name="assessmentType"
                                    value={formData.assessmentType}
                                    onChange={handleInputChange}
                                >
                                    <option value="Quiz">Quiz</option>
                                    <option value="Assignment">Assignment</option>
                                    <option value="Exam">Exam</option>
                                    <option value="Project">Project</option>
                                </select>
                            </div>

                            <div>
                                <label>Score</label>

                                <input
                                    type="number"
                                    name="score"
                                    value={formData.score}
                                    onChange={handleInputChange}
                                    min="0"
                                    step="any"
                                    placeholder="Enter score"
                                />
                            </div>

                            <div>
                                <label>Maximum Score</label>

                                <input
                                    type="number"
                                    name="maxScore"
                                    value={formData.maxScore}
                                    onChange={handleInputChange}
                                    min="0.01"
                                    step="any"
                                    placeholder="Example: 20"
                                />
                            </div>

                            <div>
                                <label>Term</label>

                                <input
                                    type="text"
                                    name="term"
                                    value={formData.term}
                                    onChange={handleInputChange}
                                    placeholder="Example: First Term"
                                />
                            </div>

                            <div>
                                <label>Assessment Date</label>

                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="gradesRemarksField">
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

                            <div className="gradesModalActions">
                                <button type="submit">
                                    {editingGrade
                                        ? "Update Grade"
                                        : "Save Grade"}
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
            {deleteGrade && (
                <div className="modalOverlay">
                    <div className="deleteConfirmationModal">
                        <h2>Delete Grade Record?</h2>

                        <p>
                            Are you sure you want to delete grade record{" "}
                            <strong>{deleteGrade._id}</strong>?
                        </p>

                        <p>This action cannot be undone.</p>

                        <div>
                            <button
                                type="button"
                                onClick={handleDelete}
                            >
                                Yes, Delete
                            </button>

                            <button
                                type="button"
                                onClick={() => setDeleteGrade(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
