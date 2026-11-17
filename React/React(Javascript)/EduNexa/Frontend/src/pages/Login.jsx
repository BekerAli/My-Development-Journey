
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    validateEmail,
    validatePassword
} from "../utils/validators";

import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

import { users } from "../data/mockData";

import "../styles/Login.css";

export default function Login() {
    const { login } = useAuth();
    const { addNotification } = useNotifications();

    const navigateToNextPart = useNavigate();

    const [authError, setAuthError] = useState("");

    const [loginFormData, setLoginFormData] = useState({
        email: "",
        password: "",
        rememberMe: false
    });

    const [loginError, setLoginError] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Get demo accounts directly from mockData users
    const demoAccounts = [
        users.find(user => user.role === "Admin"),
        users.find(user => user.role === "Teacher")
    ].filter(Boolean);

    // Fill login form when a demo account is clicked
    const handleDemoAccountClick = (demoUser) => {
        setLoginFormData({
            email: demoUser.email,
            password: demoUser.password,
            rememberMe: false
        });

        setLoginError({});
        setAuthError("");
        setShowPassword(false);
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, type, value, checked } = e.target;

        setLoginFormData(prevData => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : value
        }));

        setLoginError(prevErrors => ({
            ...prevErrors,
            [name]: ""
        }));

        setAuthError("");
    };

    // Handle login submission
    const handleSubmitAction = (e) => {
        e.preventDefault();

        if (isLoading) return;

        const emailError = validateEmail(loginFormData.email);
        const passwordError = validatePassword(loginFormData.password);

        setLoginError({
            email: emailError,
            password: passwordError
        });

        if (emailError || passwordError) {
            return;
        }

        setIsLoading(true);

        try {
            const result = login(loginFormData);

            if (result.success) {

                // Create login notification
                addNotification(
                    "Login Successful",
                    `Welcome back, ${result.user.name}! You have successfully logged in.`,
                    "success"
                );

                // Reset login form
                setLoginFormData({
                    email: "",
                    password: "",
                    rememberMe: false
                });

                setLoginError({});
                setAuthError("");
                setShowPassword(false);

                // Navigate to dashboard
                navigateToNextPart("/");

            } else {
                setAuthError(result.message);
            }

        } catch (error) {
            setAuthError("Something went wrong. Please try again.");

        } finally {
            setIsLoading(false);
        }
    };

    // Show or hide password
    const handleShowHideClick = () => {
        setShowPassword(prev => !prev);
    };

    return (
        <div className="loginPage">

            {/* Left Side */}
            <div className="leftSideOfLoginPage">
                <h1>EduNexus</h1>
                <p>School Management System</p>
            </div>

            {/* Right Side */}
            <div className="rightSideLoginPage">

                <h2>Welcome Back!</h2>
                <p>Sign In to Access Your Account</p>

                <form onSubmit={handleSubmitAction} noValidate>

                    {/* Email */}
                    <div className="inputType">
                        <label htmlFor="email">
                            Email Address
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={loginFormData.email}
                            onChange={handleInputChange}
                            placeholder="Enter Your Email Address"
                            id="email"
                        />
                    </div>

                    {loginError.email && (
                        <p>{loginError.email}</p>
                    )}

                    {/* Password */}
                    <div className="inputType">
                        <label htmlFor="password">
                            Password
                        </label>

                        <div className="passwordWrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={loginFormData.password}
                                onChange={handleInputChange}
                                placeholder="Enter Your Password"
                                id="password"
                            />

                            <button
                                type="button"
                                onClick={handleShowHideClick}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    {loginError.password && (
                        <p>{loginError.password}</p>
                    )}

                    {/* Remember Me */}
                    <div className="rememberMeandForgetPasword">
                        <label htmlFor="rememberMe">
                            <input
                                type="checkbox"
                                name="rememberMe"
                                checked={loginFormData.rememberMe}
                                onChange={handleInputChange}
                                id="rememberMe"
                            />

                            Remember Me
                        </label>

                        <p>Forget Password</p>
                    </div>

                    {/* Authentication Error */}
                    {authError && (
                        <p>{authError}</p>
                    )}

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? "Logging in..." : "Login"}
                    </button>

                </form>

                {/* Demo Accounts */}
                <div className="demoAccounts">
                    <h3>Try a Demo Account</h3>

                    <p>
                        Select an account to fill in the login details.
                    </p>

                    <div>
                        {demoAccounts.map(demoUser => (
                            <button
                                key={demoUser._id}
                                type="button"
                                onClick={() =>
                                    handleDemoAccountClick(demoUser)
                                }
                            >
                                {demoUser.role} Demo Account
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
