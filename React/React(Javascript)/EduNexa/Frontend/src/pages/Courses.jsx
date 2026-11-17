
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import MainLayout from "../components/layout/MainLayout";

import { courses, teachers } from "../data/mockData";

import "../styles/Courses.css";

export default function Courses() {
    const { user } = useAuth();
    const { addNotification } = useNotifications();
    const navigate = useNavigate();

    const isAdmin = user?.role === "Admin";
    const isTeacher = user?.role === "Teacher";

    const pageTitle = isTeacher ? "My Courses" : "Courses";

    // ========================================
    // LOAD COURSES
    // ========================================

    const [courseList, setCourseList] = useState(() => {
        try {
            const savedCourses = localStorage.getItem("eduTrackCourses");
            return savedCourses ? JSON.parse(savedCourses) : courses;
        } catch {
            return courses;
        }
    });

    // ========================================
    // LOAD TEACHERS
    // ========================================

    const [teacherList] = useState(() => {
        try {
            const savedTeachers = localStorage.getItem("eduTrackTeachers");
            return savedTeachers ? JSON.parse(savedTeachers) : teachers;
        } catch {
            return teachers;
        }
    });

    // ========================================
    // SEARCH, FILTERS AND SORTING
    // ========================================

    const [searchValue, setSearchValue] = useState("");
    const [filterGrade, setFilterGrade] = useState("All");
    const [filterStatus, setFilterStatus] = useState("All");
    const [filterTeacher, setFilterTeacher] = useState("All");

    const [sortBy, setSortBy] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");

    // ========================================
    // PAGINATION
    // ========================================

    const [currentPage, setCurrentPage] = useState(1);
    const coursesPerPage = 5;

    // ========================================
    // MODAL STATES
    // ========================================

    const [showCourseModal, setShowCourseModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [editingCourse, setEditingCourse] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);

    // ========================================
    // FORM DATA
    // ========================================

    const emptyForm = {
        name: "",
        code: "",
        description: "",
        teacherId: "",
        gradeLevel: "",
        credits: "",
        status: "Active",
    };

    const [formData, setFormData] = useState(emptyForm);
    const [formErrors, setFormErrors] = useState({});

    // ========================================
    // SAVE COURSES
    // ========================================

    const saveCourses = (updatedCourses) => {
        setCourseList(updatedCourses);

        localStorage.setItem(
            "eduTrackCourses",
            JSON.stringify(updatedCourses)
        );
    };

    // ========================================
    // TEACHER NAME HELPER
    // ========================================

    const getTeacherName = (teacherId) => {
        const teacher = teacherList.find(
            (item) => item._id === teacherId
        );

        return teacher
            ? `${teacher.firstName} ${teacher.lastName}`
            : "Teacher not found";
    };

    // ========================================
    // ROLE-BASED COURSES
    // ========================================

    const visibleCourses = isAdmin
        ? courseList
        : isTeacher
            ? courseList.filter(
                (course) => course.teacherId === user?.teacherId
            )
            : [];

    // ========================================
    // SEARCH
    // ========================================

    const searchedCourses = visibleCourses.filter((course) => {
        const search = searchValue.trim().toLowerCase();

        const teacherName = getTeacherName(course.teacherId).toLowerCase();

        return (
            String(course._id).toLowerCase().includes(search) ||
            String(course.name).toLowerCase().includes(search) ||
            String(course.code).toLowerCase().includes(search) ||
            teacherName.includes(search)
        );
    });

    // ========================================
    // FILTER
    // ========================================

    const filteredCourses = searchedCourses.filter((course) => {
        const matchesGrade =
            filterGrade === "All" ||
            course.gradeLevel === filterGrade;

        const matchesStatus =
            filterStatus === "All" ||
            course.status === filterStatus;

        const matchesTeacher =
            !isAdmin ||
            filterTeacher === "All" ||
            course.teacherId === filterTeacher;

        return matchesGrade && matchesStatus && matchesTeacher;
    });

    // ========================================
    // SORT
    // ========================================

    const sortedCourses = [...filteredCourses].sort((a, b) => {
        let firstValue = a[sortBy];
        let secondValue = b[sortBy];

        if (
            sortBy === "name" ||
            sortBy === "code" ||
            sortBy === "gradeLevel"
        ) {
            firstValue = String(firstValue || "").toLowerCase();
            secondValue = String(secondValue || "").toLowerCase();
        }

        if (sortBy === "credits") {
            firstValue = Number(firstValue);
            secondValue = Number(secondValue);
        }

        if (firstValue < secondValue) {
            return sortOrder === "asc" ? -1 : 1;
        }

        if (firstValue > secondValue) {
            return sortOrder === "asc" ? 1 : -1;
        }

        return 0;
    });

    // ========================================
    // PAGINATION CALCULATIONS
    // ========================================

    const totalPages = Math.ceil(
        sortedCourses.length / coursesPerPage
    );

    const startIndex = (currentPage - 1) * coursesPerPage;

    const paginatedCourses = sortedCourses.slice(
        startIndex,
        startIndex + coursesPerPage
    );

    // ========================================
    // SUMMARY CARDS
    // ========================================

    const totalCourses = visibleCourses.length;

    const activeCourses = visibleCourses.filter(
        (course) => course.status === "Active"
    ).length;

    const inactiveCourses = visibleCourses.filter(
        (course) => course.status === "Inactive"
    ).length;

    // ========================================
    // FORM INPUT HANDLER
    // ========================================

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setFormErrors((previous) => ({
            ...previous,
            [name]: "",
        }));
    };

    // ========================================
    // FORM VALIDATION
    // ========================================

    const validateForm = () => {
        const errors = {};

        if (!formData.name.trim()) {
            errors.name = "Course name is required";
        }

        if (!formData.code.trim()) {
            errors.code = "Course code is required";
        }

        const duplicateCourseCode = courseList.some(
            (course) =>
                String(course.code).toLowerCase() ===
                    formData.code.trim().toLowerCase() &&
                course._id !== editingCourse?._id
        );

        if (duplicateCourseCode) {
            errors.code = "This course code already exists";
        }

        if (!formData.description.trim()) {
            errors.description = "Description is required";
        }

        if (!formData.teacherId) {
            errors.teacherId = "Please select a teacher";
        }

        if (!formData.gradeLevel) {
            errors.gradeLevel = "Please select a grade";
        }

        if (
            !formData.credits ||
            Number(formData.credits) < 1 ||
            !Number.isInteger(Number(formData.credits))
        ) {
            errors.credits = "Credits must be a positive whole number";
        }

        setFormErrors(errors);

        return Object.keys(errors).length === 0;
    };

    // ========================================
    // OPEN ADD COURSE MODAL
    // ========================================

    const openAddModal = () => {
        if (!isAdmin) return;

        setEditingCourse(null);
        setFormData(emptyForm);
        setFormErrors({});
        setShowCourseModal(true);
    };

    // ========================================
    // OPEN EDIT COURSE MODAL
    // ========================================

    const openEditModal = (course) => {
        if (!isAdmin) return;

        setEditingCourse(course);

        setFormData({
            name: course.name,
            code: course.code,
            description: course.description,
            teacherId: course.teacherId,
            gradeLevel: course.gradeLevel,
            credits: String(course.credits),
            status: course.status,
        });

        setFormErrors({});
        setShowCourseModal(true);
    };

    // ========================================
    // ADD OR UPDATE COURSE
    // ========================================

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!isAdmin || !validateForm()) return;

        const now = new Date().toISOString();

        if (editingCourse) {
            const updatedCourse = {
                ...editingCourse,
                ...formData,
                credits: Number(formData.credits),
                updatedAt: now,
            };

            const updatedCourses = courseList.map((course) =>
                course._id === editingCourse._id
                    ? updatedCourse
                    : course
            );

            saveCourses(updatedCourses);

            addNotification(
                "Course Updated Successfully",
                `${updatedCourse.name} has been updated successfully.`,
                "success"
            );
        } else {
            const highestId = courseList.reduce((highest, course) => {
                const number = Number(
                    String(course._id).replace("CRS", "")
                );

                return Math.max(highest, number || 0);
            }, 0);

            const newCourse = {
                _id: `CRS${String(highestId + 1).padStart(3, "0")}`,
                ...formData,
                credits: Number(formData.credits),
                createdAt: now,
                updatedAt: now,
            };

            saveCourses([...courseList, newCourse]);

            addNotification(
                "Course Added Successfully",
                `${newCourse.name} has been added successfully.`,
                "success"
            );
        }

        setShowCourseModal(false);
        setEditingCourse(null);
        setFormData(emptyForm);
        setFormErrors({});
        setCurrentPage(1);
    };

    // ========================================
    // OPEN DELETE MODAL
    // ========================================

    const openDeleteModal = (course) => {
        if (!isAdmin) return;

        setSelectedCourse(course);
        setShowDeleteModal(true);
    };

    // ========================================
    // DELETE COURSE
    // ========================================

    const handleDelete = () => {
        if (!isAdmin || !selectedCourse) return;

        const deletedCourseName = selectedCourse.name;

        const updatedCourses = courseList.filter(
            (course) => course._id !== selectedCourse._id
        );

        saveCourses(updatedCourses);

        try {
            const savedEnrollments = JSON.parse(
                localStorage.getItem("eduTrackEnrollments")
            );

            if (Array.isArray(savedEnrollments)) {
                const updatedEnrollments = savedEnrollments.filter(
                    (enrollment) =>
                        enrollment.courseId !== selectedCourse._id
                );

                localStorage.setItem(
                    "eduTrackEnrollments",
                    JSON.stringify(updatedEnrollments)
                );
            }
        } catch {
            // Course deletion is kept even if enrollment data is unavailable.
        }

        setShowDeleteModal(false);
        setSelectedCourse(null);

        if (paginatedCourses.length === 1 && currentPage > 1) {
            setCurrentPage((previous) => previous - 1);
        }

        addNotification(
            "Course Deleted Successfully",
            `${deletedCourseName} has been deleted successfully.`,
            "success"
        );
    };

    // ========================================
    // RESET FILTERS
    // ========================================

    const resetFilters = () => {
        setSearchValue("");
        setFilterGrade("All");
        setFilterStatus("All");
        setFilterTeacher("All");
        setSortBy("name");
        setSortOrder("asc");
        setCurrentPage(1);
    };

    // ========================================
    // CLOSE COURSE MODAL
    // ========================================

    const closeCourseModal = () => {
        setShowCourseModal(false);
        setEditingCourse(null);
        setFormData(emptyForm);
        setFormErrors({});
    };

    // ========================================
    // CLOSE DELETE MODAL
    // ========================================

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setSelectedCourse(null);
    };

    // ========================================
    // RENDER
    // ========================================

    return (
        <MainLayout>
            <section className="coursesPage">

                {/* Page Header */}
                <div className="coursesPageHeader">
                    <div>
                        <h1>{pageTitle}</h1>
                        <p>Dashboard / {pageTitle}</p>
                    </div>

                    {isAdmin && (
                        <button
                            className="addCourseButton"
                            onClick={openAddModal}
                        >
                            + Add Course
                        </button>
                    )}
                </div>

                {/* Summary Cards */}
                <div className="coursesSummary">
                    <div className="summaryCard">
                        <h3>Total Courses</h3>
                        <p>{totalCourses}</p>
                    </div>

                    <div className="summaryCard">
                        <h3>Active Courses</h3>
                        <p>{activeCourses}</p>
                    </div>

                    <div className="summaryCard">
                        <h3>Inactive Courses</h3>
                        <p>{inactiveCourses}</p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="coursesFilters">
                    <input
                        type="text"
                        placeholder="Search courses by name, code or teacher..."
                        value={searchValue}
                        onChange={(event) => {
                            setSearchValue(event.target.value);
                            setCurrentPage(1);
                        }}
                    />

                    <select
                        value={filterGrade}
                        onChange={(event) => {
                            setFilterGrade(event.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="All">All Grades</option>
                        <option value="Grade 9">Grade 9</option>
                        <option value="Grade 10">Grade 10</option>
                        <option value="Grade 11">Grade 11</option>
                        <option value="Grade 12">Grade 12</option>
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(event) => {
                            setFilterStatus(event.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>

                    {isAdmin && (
                        <select
                            value={filterTeacher}
                            onChange={(event) => {
                                setFilterTeacher(event.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="All">All Teachers</option>

                            {teacherList.map((teacher) => (
                                <option
                                    key={teacher._id}
                                    value={teacher._id}
                                >
                                    {teacher.firstName} {teacher.lastName}
                                </option>
                            ))}
                        </select>
                    )}

                    <select
                        value={sortBy}
                        onChange={(event) => {
                            setSortBy(event.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="name">Sort by Name</option>
                        <option value="code">Sort by Code</option>
                        <option value="gradeLevel">Sort by Grade</option>
                        <option value="credits">Sort by Credits</option>
                    </select>

                    <select
                        value={sortOrder}
                        onChange={(event) => {
                            setSortOrder(event.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>

                    <button
                        type="button"
                        className="resetCoursesButton"
                        onClick={resetFilters}
                    >
                        Reset
                    </button>
                </div>

                {/* Courses Table */}
                <div className="coursesTableContainer">
                    <table>
                        <thead>
                            <tr>
                                <th>Course ID</th>
                                <th>Course Name</th>
                                <th>Code</th>
                                <th>Teacher</th>
                                <th>Grade</th>
                                <th>Credits</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginatedCourses.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="emptyCourses">
                                        No courses found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedCourses.map((course) => (
                                    <tr key={course._id}>
                                        <td className="courseId">
                                            {course._id}
                                        </td>

                                        <td className="courseName">
                                            {course.name}
                                        </td>

                                        <td>{course.code}</td>

                                        <td>
                                            {getTeacherName(course.teacherId)}
                                        </td>

                                        <td>{course.gradeLevel}</td>

                                        <td>{course.credits}</td>

                                        <td>
                                            <span
                                                className={`courseStatus ${
                                                    String(course.status || "inactive").toLowerCase()
                                                }`}
                                            >
                                                {course.status || "Inactive"}
                                            </span>
                                        </td>

                                        <td className="courseActions">
                                            <button
                                                type="button"
                                                className="viewCourseButton"
                                                onClick={() =>
                                                    navigate(`/courses/${course._id}`)
                                                }
                                            >
                                                View
                                            </button>

                                            {isAdmin && (
                                                <>
                                                    <button
                                                        type="button"
                                                        className="editCourseButton"
                                                        onClick={() =>
                                                            openEditModal(course)
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="deleteCourseButton"
                                                        onClick={() =>
                                                            openDeleteModal(course)
                                                        }
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
                {totalPages > 1 && (
                    <div className="coursesPagination">
                        <button
                            type="button"
                            disabled={currentPage === 1}
                            onClick={() =>
                                setCurrentPage((previous) => previous - 1)
                            }
                        >
                            Previous
                        </button>

                        <span>
                            Page {currentPage} of {totalPages}
                        </span>

                        <button
                            type="button"
                            disabled={currentPage === totalPages}
                            onClick={() =>
                                setCurrentPage((previous) => previous + 1)
                            }
                        >
                            Next
                        </button>
                    </div>
                )}

                {/* Add / Edit Course Modal */}
                {showCourseModal && (
                    <div className="modalOverlay">
                        <div className="modalContent">
                            <h2>
                                {editingCourse ? "Edit Course" : "Add Course"}
                            </h2>

                            <form onSubmit={handleSubmit}>
                                <div>
                                    <label>Course Name</label>
                                    <input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                    />
                                    {formErrors.name && (
                                        <p>{formErrors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label>Course Code</label>
                                    <input
                                        name="code"
                                        value={formData.code}
                                        onChange={handleInputChange}
                                    />
                                    {formErrors.code && (
                                        <p>{formErrors.code}</p>
                                    )}
                                </div>

                                <div>
                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                    />
                                    {formErrors.description && (
                                        <p>{formErrors.description}</p>
                                    )}
                                </div>

                                <div>
                                    <label>Assigned Teacher</label>
                                    <select
                                        name="teacherId"
                                        value={formData.teacherId}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">
                                            Select Teacher
                                        </option>

                                        {teacherList.map((teacher) => (
                                            <option
                                                key={teacher._id}
                                                value={teacher._id}
                                            >
                                                {teacher.firstName} {teacher.lastName}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.teacherId && (
                                        <p>{formErrors.teacherId}</p>
                                    )}
                                </div>

                                <div>
                                    <label>Grade Level</label>
                                    <select
                                        name="gradeLevel"
                                        value={formData.gradeLevel}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select Grade</option>
                                        <option value="Grade 9">Grade 9</option>
                                        <option value="Grade 10">Grade 10</option>
                                        <option value="Grade 11">Grade 11</option>
                                        <option value="Grade 12">Grade 12</option>
                                    </select>
                                    {formErrors.gradeLevel && (
                                        <p>{formErrors.gradeLevel}</p>
                                    )}
                                </div>

                                <div>
                                    <label>Credits</label>
                                    <input
                                        type="number"
                                        min="1"
                                        name="credits"
                                        value={formData.credits}
                                        onChange={handleInputChange}
                                    />
                                    {formErrors.credits && (
                                        <p>{formErrors.credits}</p>
                                    )}
                                </div>

                                <div>
                                    <label>Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>

                                <div className="courseModalActions">
                                    <button type="submit">
                                        {editingCourse ? "Save Changes" : "Add Course"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={closeCourseModal}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && selectedCourse && (
                    <div className="modalOverlay">
                        <div className="modalContent deleteCourseModal">
                            <h2>Delete Course</h2>

                            <p>
                                Are you sure you want to delete{" "}
                                <strong>{selectedCourse.name}</strong>?
                            </p>

                            <p>
                                Enrollments associated with this course
                                will also be deleted.
                            </p>

                            <div className="courseDeleteActions">
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                >
                                    Yes, Delete
                                </button>

                                <button
                                    type="button"
                                    onClick={closeDeleteModal}
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
