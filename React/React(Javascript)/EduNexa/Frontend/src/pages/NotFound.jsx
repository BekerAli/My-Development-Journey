
import { Link } from "react-router-dom";
import "../styles/NotFound.css";

export default function NotFound() {
    return (
        <div className="notFoundPage">
            <div className="notFoundContent">
                <div className="notFoundIcon">404</div>

                <p className="notFoundLabel">PAGE NOT FOUND</p>

                <h1>Oops! Page not found</h1>

                <p className="notFoundDescription">
                    Sorry, the page you are looking for doesn't exist,
                    may have been moved, or the URL is incorrect.
                </p>

                <Link to="/" className="notFoundHomeButton">
                    Back to Dashboard
                </Link>

                <p className="notFoundFooter">
                    EDUNexus · School Management System
                </p>
            </div>
        </div>
    );
}
