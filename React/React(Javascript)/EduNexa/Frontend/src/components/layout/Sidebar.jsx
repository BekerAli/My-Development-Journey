
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import "../../styles/Sidebar.css";

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const adminLinks = [
        { name: "Dashboard", path: "/", icon: "⌂" },
        { name: "Students", path: "/students", icon: "♙" },
        { name: "Teachers", path: "/teachers", icon: "♟" },
        { name: "Courses", path: "/courses", icon: "▣" },
        { name: "Enrollments", path: "/enrollments", icon: "▤" },
        { name: "Attendance", path: "/attendance", icon: "◷" },
        { name: "Grades", path: "/grades", icon: "▧" },
        { name: "Reports", path: "/reports", icon: "▥" }
    ];

    const teacherLinks = [
        { name: "Dashboard", path: "/", icon: "⌂" },
        { name: "My Courses", path: "/courses", icon: "▣" },
        { name: "My Students", path: "/students", icon: "♙" },
        { name: "Attendance", path: "/attendance", icon: "◷" },
        { name: "Grades", path: "/grades", icon: "▧" }
    ];

    const navigationSidebarLists =
        user?.role === "Admin"
            ? adminLinks
            : user?.role === "Teacher"
                ? teacherLinks
                : [];

    const handleLogoutBtn = () => {
        logout();
        navigate("/login", { replace: true });
    };

    const userInitials = user?.name
        ? user.name
            .split(" ")
            .map((part) => part.charAt(0))
            .slice(0, 2)
            .join("")
            .toUpperCase()
        : "U";

    return (
        <aside className="app-sidebar">

            {/* Brand */}
            <div className="sidebar-brand">
                <div className="sidebar-brand-icon">
                    <span>🎓</span>
                </div>

                <div className="sidebar-brand-text">
                    <h2>EDUNexus</h2>
                    <p>School Management</p>
                </div>
            </div>

            {/* Navigation */}
            <div className="sidebar-navigation">

                <p className="sidebar-section-title">
                    MAIN MENU
                </p>

                <nav className="sidebar-nav">
                    {navigationSidebarLists.map((sidebarLists) => (
                        <NavLink
                            key={sidebarLists.path}
                            to={sidebarLists.path}
                            end={sidebarLists.path === "/"}
                            className={({ isActive }) =>
                                isActive
                                    ? "sidebar-link active"
                                    : "sidebar-link"
                            }
                        >
                            <span className="sidebar-link-icon">
                                {sidebarLists.icon}
                            </span>

                            <span className="sidebar-link-name">
                                {sidebarLists.name}
                            </span>

                            <span className="sidebar-active-indicator"></span>
                        </NavLink>
                    ))}
                </nav>

            </div>

            {/* Sidebar Bottom */}
            <div className="sidebar-bottom">

                <div className="sidebar-promo">
                    <div className="sidebar-promo-icon">
                        🎓
                    </div>

                    <h3>Building a Better Learning Tomorrow</h3>

                    <p>
                        Making school management easier every day.
                    </p>
                </div>

                {/* User Profile */}
                <div className="sidebar-user">

                    <div className="sidebar-user-avatar">
                        {userInitials}
                    </div>

                    <div className="sidebar-user-info">
                        <h4>{user?.name}</h4>
                        <p>{user?.role}</p>
                    </div>

                    <button
                        type="button"
                        className="sidebar-logout-btn"
                        onClick={handleLogoutBtn}
                        title="Logout"
                        aria-label="Logout"
                    >
                        ↪
                    </button>

                </div>

            </div>

        </aside>
    );
}
