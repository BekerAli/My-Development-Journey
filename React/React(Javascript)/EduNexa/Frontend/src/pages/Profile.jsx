
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";

import "../styles/Profile.css";

export default function Profile() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const userInitials = user?.name
        ? user.name
            .split(" ")
            .map((part) => part.charAt(0))
            .slice(0, 2)
            .join("")
            .toUpperCase()
        : "U";

    return (
        <MainLayout>
            <section className="profilePage">

                {/* Page Header */}
                <div className="profilePageHeader">
                    <div>
                        <h2>My Profile</h2>
                        <p>
                            View your personal and account information.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="profileBackButton"
                        onClick={() => navigate("/")}
                    >
                        ← Back to Dashboard
                    </button>
                </div>

                {/* Profile Content */}
                <div className="profileContent">

                    {/* Profile Overview */}
                    <div className="profileOverview">

                        <div className="profileAvatar">
                            {userInitials}
                        </div>

                        <div className="profileOverviewInfo">
                            <h2>{user?.name || "User"}</h2>
                            <p>{user?.email || "No email available"}</p>

                            <span className="profileRoleBadge">
                                {user?.role || "User"}
                            </span>
                        </div>

                    </div>

                    {/* Personal Information */}
                    <div className="profileInformationCard">

                        <div className="profileCardHeader">
                            <div>
                                <h3>Personal Information</h3>
                                <p>Your personal account details.</p>
                            </div>
                        </div>

                        <div className="profileInformationGrid">

                            <div className="profileInformationItem">
                                <span className="profileInformationLabel">
                                    Full Name
                                </span>
                                <h4>{user?.name || "Not available"}</h4>
                            </div>

                            <div className="profileInformationItem">
                                <span className="profileInformationLabel">
                                    Email Address
                                </span>
                                <h4>{user?.email || "Not available"}</h4>
                            </div>

                            <div className="profileInformationItem">
                                <span className="profileInformationLabel">
                                    Account Role
                                </span>
                                <h4>{user?.role || "Not available"}</h4>
                            </div>

                            <div className="profileInformationItem">
                                <span className="profileInformationLabel">
                                    Account Status
                                </span>
                                <span className="profileActiveStatus">
                                    Active
                                </span>
                            </div>

                        </div>

                    </div>

                    {/* Account Information */}
                    <div className="profileInformationCard">

                        <div className="profileCardHeader">
                            <div>
                                <h3>Account Information</h3>
                                <p>
                                    Information about your EduTrack account.
                                </p>
                            </div>
                        </div>

                        <div className="profileAccountInfo">

                            <div className="profileAccountRow">
                                <span>Account Type</span>
                                <strong>{user?.role || "User"}</strong>
                            </div>

                            <div className="profileAccountRow">
                                <span>Platform</span>
                                <strong>EduTrack</strong>
                            </div>

                            <div className="profileAccountRow">
                                <span>Access</span>
                                <strong>
                                    {user?.role === "Admin"
                                        ? "Administrator"
                                        : "Teacher"}
                                </strong>
                            </div>

                        </div>

                    </div>

                </div>

            </section>
        </MainLayout>
    );
}
