
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { useLocation, useNavigate } from "react-router-dom";

import "../../styles/Navbar.css";

export default function Navbar() {
    const { user, logout } = useAuth();

    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification
    } = useNotifications();

    const location = useLocation();
    const navigate = useNavigate();

    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    const userMenuRef = useRef(null);
    const notificationMenuRef = useRef(null);

    const pageTitles = {
        "/": "Dashboard",
        "/students": "Students",
        "/teachers": "Teachers",
        "/courses": "Courses",
        "/enrollments": "Enrollments",
        "/attendance": "Attendance",
        "/grades": "Grades",
        "/reports": "Reports",
        "/profile": "My Profile"
    };

    const currentPageTitle = pageTitles[location.pathname] || "Page";

    const userInitials = user?.name
        ? user.name
            .split(" ")
            .map((part) => part.charAt(0))
            .slice(0, 2)
            .join("")
            .toUpperCase()
        : "U";

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(event.target)
            ) {
                setShowUserMenu(false);
            }

            if (
                notificationMenuRef.current &&
                !notificationMenuRef.current.contains(event.target)
            ) {
                setShowNotifications(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    function handleLogout() {
        setShowUserMenu(false);
        logout();
        navigate("/login");
    }

    function handleProfile() {
        setShowUserMenu(false);
        navigate("/profile");
    }

    function handleNotificationClick(notification) {
        markAsRead(notification.id);
    }

    function formatNotificationDate(date) {
        return new Date(date).toLocaleString();
    }

    return (
        <header className="app-navbar">

            {/* Page Information */}
            <div className="navbar-page-info">
                <div className="navbar-breadcrumb">
                    <span>Workspace</span>
                    <span className="breadcrumb-divider">/</span>
                    <span className="breadcrumb-current">
                        {currentPageTitle}
                    </span>
                </div>

                <h1>{currentPageTitle}</h1>

                <p>
                    Welcome back, {user?.name || "User"}.
                    Here's what's happening today.
                </p>
            </div>

            {/* Navbar Actions */}
            <div className="navbar-actions">

                {/* Notification Button and Dropdown */}
                <div
                    className="navbar-notification-wrapper"
                    ref={notificationMenuRef}
                >
                    <button
                        type="button"
                        className="navbar-notification"
                        onClick={() => {
                            setShowNotifications((previous) => !previous);
                            setShowUserMenu(false);
                        }}
                        aria-label="Notifications"
                        aria-expanded={showNotifications}
                    >
                        ♧

                        {unreadCount > 0 && (
                            <span className="notification-count">
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="notification-dropdown">

                            <div className="notification-dropdown-header">
                                <div>
                                    <h3>Notifications</h3>
                                    <p>
                                        {unreadCount} unread notifications
                                    </p>
                                </div>

                                {unreadCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={markAllAsRead}
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>

                            <div className="notification-list">

                                {notifications.length === 0 ? (
                                    <div className="notification-empty">
                                        <span>♧</span>
                                        <h4>No notifications yet</h4>
                                        <p>
                                            Your recent activities will appear here.
                                        </p>
                                    </div>
                                ) : (
                                    notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`notification-item ${
                                                !notification.read ? "unread" : ""
                                            }`}
                                        >
                                            <button
                                                type="button"
                                                className="notification-item-content"
                                                onClick={() =>
                                                    handleNotificationClick(notification)
                                                }
                                            >
                                                <span className={`notification-type ${notification.type}`}>
                                                    ●
                                                </span>

                                                <span className="notification-text">
                                                    <strong>
                                                        {notification.title}
                                                    </strong>

                                                    <span>
                                                        {notification.message}
                                                    </span>

                                                    <small>
                                                        {formatNotificationDate(
                                                            notification.createdAt
                                                        )}
                                                    </small>
                                                </span>
                                            </button>

                                            <div className="notification-item-actions">
                                                {!notification.read && (
                                                    <button
                                                        type="button"
                                                        title="Mark as read"
                                                        aria-label="Mark as read"
                                                        onClick={() =>
                                                            markAsRead(notification.id)
                                                        }
                                                    >
                                                        ✓
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    title="Delete notification"
                                                    aria-label="Delete notification"
                                                    onClick={() =>
                                                        deleteNotification(notification.id)
                                                    }
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}

                            </div>
                        </div>
                    )}
                </div>

                <div className="navbar-divider"></div>

                {/* User Profile Dropdown */}
                <div
                    className="navbar-user-wrapper"
                    ref={userMenuRef}
                >
                    <div className="navbar-user">
                        <div className="navbar-user-avatar">
                            {userInitials}
                        </div>

                        <div className="navbar-user-info">
                            <h3>{user?.name}</h3>
                            <p>{user?.role}</p>
                        </div>

                        <button
                            type="button"
                            className={`navbar-user-arrow ${
                                showUserMenu ? "active" : ""
                            }`}
                            onClick={() => {
                                setShowUserMenu((previous) => !previous);
                                setShowNotifications(false);
                            }}
                            aria-label="Open user menu"
                            aria-expanded={showUserMenu}
                        >
                            ⌄
                        </button>
                    </div>

                    {showUserMenu && (
                        <div className="navbar-user-dropdown">
                            <button
                                type="button"
                                className="dropdown-menu-item"
                                onClick={handleProfile}
                            >
                                <span>♙</span>
                                <span>My Profile</span>
                            </button>

                            <div className="dropdown-menu-divider"></div>

                            <button
                                type="button"
                                className="dropdown-menu-item logout-item"
                                onClick={handleLogout}
                            >
                                <span>↪</span>
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </header>
    );
}
