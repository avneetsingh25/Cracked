import "./Login.css";
import Navbar from "../../components/Navbar/Navbar";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            const response = await fetch(
                "http://localhost:3000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("accessToken", data.accessToken);
                navigate("/dashboard");
            } else {
                setError(data.message || "Unable to log in. Check your details and try again.");
            }
        } catch (error) {
            console.log("Login error:", error);
            setError("We couldn't connect to the server. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Navbar />

            <main className="login-page auth-page">
                <div className="login-card auth-card">
                    <div className="auth-heading">
                        <h1>Welcome back</h1>
                        <p className="login-subtitle auth-subtitle">
                            Sign in to pick up where your interview preparation left off.
                        </p>
                    </div>
                    {location.state?.message && (
                        <p className="auth-success" role="status">{location.state.message}</p>
                    )}
                    {error && <p className="auth-error" role="alert">{error}</p>}
                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label htmlFor="login-email">Email address</label>
                            <input
                                id="login-email"
                                type="email"
                                autoComplete="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="login-password">Password</label>
                            <input
                                id="login-password"
                                type="password"
                                autoComplete="current-password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="login-submit-btn auth-submit" disabled={submitting}>
                            {submitting ? "Signing in..." : "Sign in"}
                        </button>
                    </form>
                    <p className="register-text auth-switch">
                        Don't have an account?
                        <Link to="/register"> Create one</Link>
                    </p>
                </div>
            </main>
        </>
    );
}

export default Login;