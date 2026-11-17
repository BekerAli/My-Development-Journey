
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

import MainLayout from "../components/layout/MainLayout";

import { teachers } from "../data/mockData";

import "../styles/Teachers.css";

// Empty Teacher Form
const emptyTeacherForm = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    qualification: "",
    specialization: "",
    hireDate: "",
    address: "",
    status: "Active"
};

const ITEMS_PER_PAGE = 5;

export default function Teachers() {
    const { user } = useAuth();
    const { addNotification } = useNotifications();
    const navigate = useNavigate();

    const isAdmin = user?.role === "Admin";

    // Load Teachers
    const [teacherList, setTeacherList] = useState(() => {
        try {
            const savedTeachers = localStorage.getItem("eduTrackTeachers");

            return savedTeachers
                ? JSON.parse(savedTeachers)
                : teachers;
        } catch {
            return teachers;
        }
    });

    // Search
    const [searchValue, setSearchValue] = useState("");

    // Filters
    const [statusFilter, setStatusFilter] = useState("All");
    const [genderFilter, setGenderFilter] = useState("All");
    const [specializationFilter, setSpecializationFilter] = useState("All");

    // Sorting
    const [sortBy, setSortBy] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    // Add/Edit Modal
    const [showTeacherModal, setShowTeacherModal] = useState(false);
    const [modalMode, setModalMode] = useState("add");
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [teacherForm, setTeacherForm] = useState(emptyTeacherForm);
    const [formErrors, setFormErrors] = useState({});

    // Delete Modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [teacherToDelete, setTeacherToDelete] = useState(null);

    // Save Teachers to localStorage
    const saveTeachers = (updatedTeachers) => {
        setTeacherList(updatedTeachers);

        localStorage.setItem(
            "eduTrackTeachers",
            JSON.stringify(updatedTeachers)
        );
    };

    // Search Teachers
    const searchedTeachers = teacherList.filter((teacher) => {
        const search = searchValue.trim().toLowerCase();

        const fullName =
            `${teacher.firstName} ${teacher.lastName}`.toLowerCase();

        return (
            (teacher._id || "").toLowerCase().includes(search) ||
            (teacher.firstName || "").toLowerCase().includes(search) ||
            (teacher.lastName || "").toLowerCase().includes(search) ||
            fullName.includes(search) ||
            (teacher.email || "").toLowerCase().includes(search) ||
            (teacher.specialization || "").toLowerCase().includes(search)
        );
    });

    // Filter Teachers
    const filteredTeachers = searchedTeachers.filter((teacher) => {
        const matchesStatus =
            statusFilter === "All" ||
            teacher.status === statusFilter;

        const matchesGender =
            genderFilter === "All" ||
            teacher.gender === genderFilter;

        const matchesSpecialization =
            specializationFilter === "All" ||
            teacher.specialization === specializationFilter;

        return (
            matchesStatus &&
            matchesGender &&
            matchesSpecialization
        );
    });

    // Sort Teachers
    const sortedTeachers = [...filteredTeachers].sort((a, b) => {
        let valueA;
        let valueB;

        if (sortBy === "name") {
            valueA = `${a.firstName} ${a.lastName}`.toLowerCase();
            valueB = `${b.firstName} ${b.lastName}`.toLowerCase();
        } else if (sortBy === "id") {
            valueA = a._id || "";
            valueB = b._id || "";
        } else if (sortBy === "specialization") {
            valueA = (a.specialization || "").toLowerCase();
            valueB = (b.specialization || "").toLowerCase();
        } else if (sortBy === "hireDate") {
            valueA = new Date(a.hireDate || 0).getTime();
            valueB = new Date(b.hireDate || 0).getTime();
        }

        let result;

        if (valueA < valueB) {
            result = -1;
        } else if (valueA > valueB) {
            result = 1;
        } else {
            result = 0;
        }

        return sortOrder === "asc" ? result : -result;
    });

    // Pagination
    const totalPages = Math.ceil(
        sortedTeachers.length / ITEMS_PER_PAGE
    );

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    const paginatedTeachers = sortedTeachers.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
    );

    // Teacher Statistics
    const totalTeachers = teacherList.length;

    const activeTeachers = teacherList.filter(
        (teacher) => teacher.status === "Active"
    ).length;

    const inactiveTeachers = teacherList.filter(
        (teacher) => teacher.status === "Inactive"
    ).length;

    // Unique Specializations
    const specializations = [
        ...new Set(
            teacherList
                .map((teacher) => teacher.specialization)
                .filter(Boolean)
        )
    ].sort();

    // Reset Pagination
    const resetPagination = () => {
        setCurrentPage(1);
    };

    // Handle Search
    const handleSearch = (e) => {
        setSearchValue(e.target.value);
        resetPagination();
    };

    // Handle Filters
    const handleStatusFilter = (e) => {
        setStatusFilter(e.target.value);
        resetPagination();
    };

    const handleGenderFilter = (e) => {
        setGenderFilter(e.target.value);
        resetPagination();
    };

    const handleSpecializationFilter = (e) => {
        setSpecializationFilter(e.target.value);
        resetPagination();
    };

    // Handle Sorting
    const handleSort = (e) => {
        setSortBy(e.target.value);
        resetPagination();
    };

    const handleSortOrder = (e) => {
        setSortOrder(e.target.value);
        resetPagination();
    };

    // Generate Next Teacher ID
    const generateTeacherId = () => {
        const highestId = teacherList.reduce((highest, teacher) => {
            const number = Number(
                String(teacher._id || "").replace("TCH", "")
            );

            return Number.isFinite(number) && number > highest
                ? number
                : highest;
        }, 0);

        return `TCH${String(highestId + 1).padStart(3, "0")}`;
    };

    // Open Add Teacher Modal
    const handleOpenAddModal = () => {
        setModalMode("add");
        setSelectedTeacher(null);
        setTeacherForm(emptyTeacherForm);
        setFormErrors({});
        setShowTeacherModal(true);
    };

    // Open Edit Teacher Modal
    const handleOpenEditModal = (teacher) => {
        setModalMode("edit");
        setSelectedTeacher(teacher);

        setTeacherForm({
            firstName: teacher.firstName || "",
            lastName: teacher.lastName || "",
            email: teacher.email || "",
            phone: teacher.phone || "",
            gender: teacher.gender || "",
            dateOfBirth: (teacher.dateOfBirth || "").slice(0, 10),
            qualification: teacher.qualification || "",
            specialization: teacher.specialization || "",
            hireDate: (teacher.hireDate || "").slice(0, 10),
            address: teacher.address || "",
            status: teacher.status || "Active"
        });

        setFormErrors({});
        setShowTeacherModal(true);
    };

    // Handle Form Changes
    const handleFormChange = (e) => {
        const { name, value } = e.target;

        setTeacherForm((previousData) => ({
            ...previousData,
            [name]: value
        }));

        setFormErrors((previousErrors) => ({
            ...previousErrors,
            [name]: ""
        }));
    };

    // Validate Teacher Form
    const validateTeacherForm = () => {
        const errors = {};

        if (!teacherForm.firstName.trim()) {
            errors.firstName = "First name is required";
        }

        if (!teacherForm.lastName.trim()) {
            errors.lastName = "Last name is required";
        }

        if (!teacherForm.email.trim()) {
            errors.email = "Email is required";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                teacherForm.email.trim()
            )
        ) {
            errors.email = "Enter a valid email address";
        } else if (
            teacherList.some(
                (teacher) =>
                    teacher._id !== selectedTeacher?._id &&
                    (teacher.email || "").toLowerCase() ===
                    teacherForm.email.trim().toLowerCase()
            )
        ) {
            errors.email = "This email is already registered";
        }

        if (!teacherForm.phone.trim()) {
            errors.phone = "Phone number is required";
        } else if (
            !/^\+?[0-9\s-]{7,15}$/.test(
                teacherForm.phone.trim()
            )
        ) {
            errors.phone = "Enter a valid phone number";
        }

        if (!teacherForm.gender) {
            errors.gender = "Please select gender";
        }

        if (!teacherForm.dateOfBirth) {
            errors.dateOfBirth = "Date of birth is required";
        }

        if (!teacherForm.qualification.trim()) {
            errors.qualification = "Qualification is required";
        }

        if (!teacherForm.specialization.trim()) {
            errors.specialization = "Specialization is required";
        }

        if (!teacherForm.hireDate) {
            errors.hireDate = "Hire date is required";
        }

        if (!teacherForm.address.trim()) {
            errors.address = "Address is required";
        }

        if (!teacherForm.status) {
            errors.status = "Please select status";
        }

        setFormErrors(errors);

        return Object.keys(errors).length === 0;
    };

    // Add or Edit Teacher
    const handleTeacherSubmit = (e) => {
        e.preventDefault();

        if (!validateTeacherForm()) {
            return;
        }

        const currentDate = new Date().toISOString();

        if (modalMode === "add") {
            const newTeacher = {
                _id: generateTeacherId(),
                ...teacherForm,
                firstName: teacherForm.firstName.trim(),
                lastName: teacherForm.lastName.trim(),
                email: teacherForm.email.trim().toLowerCase(),
                phone: teacherForm.phone.trim(),
                qualification: teacherForm.qualification.trim(),
                specialization: teacherForm.specialization.trim(),
                address: teacherForm.address.trim(),
                createdAt: currentDate,
                updatedAt: currentDate
            };

            const updatedTeachers = [
                ...teacherList,
                newTeacher
            ];

            saveTeachers(updatedTeachers);

            // Add Notification
            addNotification(
                "Teacher Added Successfully",
                `${newTeacher.firstName} ${newTeacher.lastName} has been added successfully.`,
                "success"
            );

        } else {
            const updatedTeacher = {
                ...selectedTeacher,
                ...teacherForm,
                firstName: teacherForm.firstName.trim(),
                lastName: teacherForm.lastName.trim(),
                email: teacherForm.email.trim().toLowerCase(),
                phone: teacherForm.phone.trim(),
                qualification: teacherForm.qualification.trim(),
                specialization: teacherForm.specialization.trim(),
                address: teacherForm.address.trim(),
                updatedAt: currentDate
            };

            const updatedTeachers = teacherList.map((teacher) =>
                teacher._id === selectedTeacher._id
                    ? updatedTeacher
                    : teacher
            );

            saveTeachers(updatedTeachers);

            // Update Notification
            addNotification(
                "Teacher Updated Successfully",
                `${updatedTeacher.firstName} ${updatedTeacher.lastName}'s information has been updated.`,
                "success"
            );
        }

        setShowTeacherModal(false);
        setTeacherForm(emptyTeacherForm);
        setFormErrors({});
        setSelectedTeacher(null);
        resetPagination();
    };

    // Close Teacher Modal
    const handleCloseTeacherModal = () => {
        setShowTeacherModal(false);
        setTeacherForm(emptyTeacherForm);
        setFormErrors({});
        setSelectedTeacher(null);
    };

    // Open Delete Confirmation
    const handleOpenDeleteModal = (teacher) => {
        setTeacherToDelete(teacher);
        setShowDeleteModal(true);
    };

    // Confirm Delete Teacher
    const handleConfirmDelete = () => {
        if (!teacherToDelete) return;

        const deletedTeacherName =
            `${teacherToDelete.firstName} ${teacherToDelete.lastName}`;

        const updatedTeachers = teacherList.filter(
            (teacher) => teacher._id !== teacherToDelete._id
        );

        saveTeachers(updatedTeachers);

        setShowDeleteModal(false);
        setTeacherToDelete(null);

        // Delete Notification
        addNotification(
            "Teacher Deleted Successfully",
            `${deletedTeacherName} has been deleted successfully.`,
            "success"
        );

        if (currentPage > 1 && paginatedTeachers.length === 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Cancel Delete
    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setTeacherToDelete(null);
    };

    // View Teacher Details
    const handleViewTeacher = (teacherId) => {
        navigate(`/teachers/${teacherId}`);
    };

    // Format Date
    const formatDate = (date) => {
        if (!date) return "Not available";

        const formattedDate = new Date(date);

        if (Number.isNaN(formattedDate.getTime())) {
            return "Not available";
        }

        return formattedDate.toLocaleDateString();
    };

    return (
        <MainLayout>
            <div className="teachersPage">

                <section className="teachersContent">

                    {/* Page Header */}
                    <div className="teachersPageHeader">
                        <div>
                            <h1>Teachers Management</h1>
                            <p>Dashboard / Teachers</p>
                        </div>

                        {isAdmin && (
                            <button
                                type="button"
                                onClick={handleOpenAddModal}
                            >
                                Add Teacher
                            </button>
                        )}
                    </div>

                    {/* Summary Cards */}
                    <div className="teacherSummaryCards">

                        <div className="teacherSummaryCard">
                            <h3>Total Teachers</h3>
                            <p>{totalTeachers}</p>
                        </div>

                        <div className="teacherSummaryCard">
                            <h3>Active Teachers</h3>
                            <p>{activeTeachers}</p>
                        </div>

                        <div className="teacherSummaryCard">
                            <h3>Inactive Teachers</h3>
                            <p>{inactiveTeachers}</p>
                        </div>

                    </div>

                    {/* Search and Filters */}
                    <div className="teachersControls">

                        <div className="teacherSearch">
                            <input
                                type="text"
                                placeholder="Search by ID, name, email, specialization..."
                                value={searchValue}
                                onChange={handleSearch}
                            />
                        </div>

                        <div className="teacherFilters">

                            <select
                                value={statusFilter}
                                onChange={handleStatusFilter}
                            >
                                <option value="All">All Statuses</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>

                            <select
                                value={genderFilter}
                                onChange={handleGenderFilter}
                            >
                                <option value="All">All Genders</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>

                            <select
                                value={specializationFilter}
                                onChange={handleSpecializationFilter}
                            >
                                <option value="All">All Specializations</option>

                                {specializations.map((specialization) => (
                                    <option
                                        key={specialization}
                                        value={specialization}
                                    >
                                        {specialization}
                                    </option>
                                ))}
                            </select>

                        </div>

                        {/* Sorting */}
                        <div className="teacherSorting">

                            <select
                                value={sortBy}
                                onChange={handleSort}
                            >
                                <option value="name">Sort by Name</option>
                                <option value="id">Sort by ID</option>
                                <option value="specialization">
                                    Sort by Specialization
                                </option>
                                <option value="hireDate">
                                    Sort by Hire Date
                                </option>
                            </select>

                            <select
                                value={sortOrder}
                                onChange={handleSortOrder}
                            >
                                <option value="asc">Ascending</option>
                                <option value="desc">Descending</option>
                            </select>

                        </div>

                    </div>

                    {/* Teachers Table */}
                    <div className="teachersTableContainer">

                        <div className="teachersTableHeader">
                            <h2>All Teachers</h2>

                            <p>
                                Showing{" "}
                                {sortedTeachers.length === 0
                                    ? 0
                                    : startIndex + 1}
                                {" - "}
                                {Math.min(
                                    startIndex + ITEMS_PER_PAGE,
                                    sortedTeachers.length
                                )}
                                {" of "}
                                {sortedTeachers.length} teachers
                            </p>
                        </div>

                        <div className="teachersTableWrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Teacher ID</th>
                                        <th>Full Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Specialization</th>
                                        <th>Qualification</th>
                                        <th>Hire Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {paginatedTeachers.length === 0 ? (
                                        <tr>
                                            <td colSpan="9">
                                                No teachers found.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedTeachers.map((teacher) => (
                                            <tr key={teacher._id}>

                                                <td>{teacher._id}</td>

                                                <td>
                                                    {teacher.firstName}{" "}
                                                    {teacher.lastName}
                                                </td>

                                                <td>{teacher.email}</td>

                                                <td>{teacher.phone}</td>

                                                <td>{teacher.specialization}</td>

                                                <td>{teacher.qualification}</td>

                                                <td>
                                                    {formatDate(teacher.hireDate)}
                                                </td>

                                                <td>
                                                    <span className="teacherStatus">
                                                        {teacher.status}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="teacherActionButtons">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleViewTeacher(teacher._id)
                                                            }
                                                        >
                                                            View
                                                        </button>

                                                        {isAdmin && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleOpenEditModal(teacher)
                                                                    }
                                                                >
                                                                    Edit
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleOpenDeleteModal(teacher)
                                                                    }
                                                                >
                                                                    Delete
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>

                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="teacherPagination">

                                <button
                                    type="button"
                                    disabled={currentPage === 1}
                                    onClick={() =>
                                        setCurrentPage((page) => page - 1)
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
                                        setCurrentPage((page) => page + 1)
                                    }
                                >
                                    Next
                                </button>

                            </div>
                        )}

                    </div>

                </section>

                {/* Add / Edit Teacher Modal */}
                {showTeacherModal && (
                    <div
                        className="modalOverlay"
                        onClick={handleCloseTeacherModal}
                    >
                        <div
                            className="modalBox"
                            onClick={(e) => e.stopPropagation()}
                        >

                            <div className="modalHeader">
                                <div>
                                    <h2>
                                        {modalMode === "add"
                                            ? "Add Teacher"
                                            : "Edit Teacher"}
                                    </h2>

                                    <p>
                                        {modalMode === "add"
                                            ? "Enter the teacher's information."
                                            : "Update the teacher's information."}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="modalCloseBtn"
                                    onClick={handleCloseTeacherModal}
                                >
                                    &times;
                                </button>
                            </div>

                            <form onSubmit={handleTeacherSubmit}>

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
                                                    value={teacherForm.firstName}
                                                    onChange={handleFormChange}
                                                />
                                                {formErrors.firstName && (
                                                    <p className="errorMessage">
                                                        {formErrors.firstName}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="modalFormGroup">
                                                <label>Last Name</label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={teacherForm.lastName}
                                                    onChange={handleFormChange}
                                                />
                                                {formErrors.lastName && (
                                                    <p className="errorMessage">
                                                        {formErrors.lastName}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="modalFormGroup">
                                                <label>Gender</label>
                                                <select
                                                    name="gender"
                                                    value={teacherForm.gender}
                                                    onChange={handleFormChange}
                                                >
                                                    <option value="">Select Gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                </select>
                                                {formErrors.gender && (
                                                    <p className="errorMessage">
                                                        {formErrors.gender}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="modalFormGroup">
                                                <label>Date of Birth</label>
                                                <input
                                                    type="date"
                                                    name="dateOfBirth"
                                                    value={teacherForm.dateOfBirth}
                                                    onChange={handleFormChange}
                                                />
                                                {formErrors.dateOfBirth && (
                                                    <p className="errorMessage">
                                                        {formErrors.dateOfBirth}
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
                                                <label>Email</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={teacherForm.email}
                                                    onChange={handleFormChange}
                                                />
                                                {formErrors.email && (
                                                    <p className="errorMessage">
                                                        {formErrors.email}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="modalFormGroup">
                                                <label>Phone</label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={teacherForm.phone}
                                                    onChange={handleFormChange}
                                                />
                                                {formErrors.phone && (
                                                    <p className="errorMessage">
                                                        {formErrors.phone}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="modalFormGroup fullWidth">
                                                <label>Address</label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={teacherForm.address}
                                                    onChange={handleFormChange}
                                                />
                                                {formErrors.address && (
                                                    <p className="errorMessage">
                                                        {formErrors.address}
                                                    </p>
                                                )}
                                            </div>

                                        </div>
                                    </div>

                                    {/* Professional Information */}
                                    <div className="modalSection">
                                        <h3>Professional Information</h3>

                                        <div className="modalFormGrid">

                                            <div className="modalFormGroup">
                                                <label>Qualification</label>
                                                <input
                                                    type="text"
                                                    name="qualification"
                                                    value={teacherForm.qualification}
                                                    onChange={handleFormChange}
                                                    placeholder="e.g. MSc in Mathematics"
                                                />
                                                {formErrors.qualification && (
                                                    <p className="errorMessage">
                                                        {formErrors.qualification}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="modalFormGroup">
                                                <label>Specialization</label>
                                                <input
                                                    type="text"
                                                    name="specialization"
                                                    value={teacherForm.specialization}
                                                    onChange={handleFormChange}
                                                    placeholder="e.g. Mathematics"
                                                />
                                                {formErrors.specialization && (
                                                    <p className="errorMessage">
                                                        {formErrors.specialization}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="modalFormGroup">
                                                <label>Hire Date</label>
                                                <input
                                                    type="date"
                                                    name="hireDate"
                                                    value={teacherForm.hireDate}
                                                    onChange={handleFormChange}
                                                />
                                                {formErrors.hireDate && (
                                                    <p className="errorMessage">
                                                        {formErrors.hireDate}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="modalFormGroup">
                                                <label>Status</label>
                                                <select
                                                    name="status"
                                                    value={teacherForm.status}
                                                    onChange={handleFormChange}
                                                >
                                                    <option value="Active">Active</option>
                                                    <option value="Inactive">Inactive</option>
                                                </select>
                                            </div>

                                        </div>
                                    </div>

                                </div>

                                <div className="modalFooter">

                                    <button
                                        type="button"
                                        className="modalCancelBtn"
                                        onClick={handleCloseTeacherModal}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="modalSaveBtn"
                                    >
                                        {modalMode === "add"
                                            ? "Add Teacher"
                                            : "Save Changes"}
                                    </button>

                                </div>

                            </form>

                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && teacherToDelete && (
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
                                    <h2>Delete Teacher</h2>
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
                                        {teacherToDelete.firstName}{" "}
                                        {teacherToDelete.lastName}
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
                                    Delete Teacher
                                </button>

                            </div>

                        </div>
                    </div>
                )}

            </div>
        </MainLayout>
    );
}
