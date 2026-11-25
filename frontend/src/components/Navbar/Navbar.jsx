import "./Navbar.css";
import { Link, useLocation } from "react-router-dom";
import { FaMoon } from "react-icons/fa";
import logo from "../../assets/images/logo.svg";

function Navbar(){
    const { pathname } = useLocation();
    const isHome = pathname === "/";
    const isAuthenticated = Boolean(localStorage.getItem("accessToken"));

    return(
        <nav className={`navbar ${isHome ? "navbar-home" : "navbar-app"}`}>
            <Link to={isAuthenticated && !isHome ? "/dashboard" : "/"} className="navbar-logo">
                <img src={logo} alt="Cracked Logo" className="logo" />
                <div>
                    <h2>Cracked</h2>
                    <p>AI Interview System</p>
                </div>
            </Link>
            {isHome && (
                <ul className="navbar-links">
                    <li><a href="#features">Features</a></li>
                    <li><a href="#how-it-works">How it works</a></li>
                    <li><a href="#">Resume Checker</a></li>
                    <li><a href="#">About us</a></li>
                </ul>
            )}
            <div className="navbar-actions">
                {isHome ? (
                    <>
                        <FaMoon className="moon-icon" />
                        <Link to="/login" className="login-btn">Login</Link>
                        <Link to="/register" className="signup-btn">Get Started Free</Link>
                    </>
                ) : isAuthenticated ? (
                    <Link to="/dashboard" className="signup-btn">
                        My dashboard
                    </Link>
                ) : (
                    <>
                        <Link to="/login" className="login-btn">Login</Link>
                        <Link to="/register" className="signup-btn">
                            Get started free
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;