import "./Register.css";
import Navbar from "../../components/Navbar/Navbar";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            const response = await fetch(
                "http://localhost:3000/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        username,
                        email,
                        password
                    })
                }
            );
            const data = await response.json();
            if (response.ok) {
                navigate("/login", {
                    state: { message: "Your account is ready. Sign in to get started." }
                });
            } else {
                setError(data.message || "Unable to create your account. Please try again.");
            }
        } catch (error) {
            console.log("Registration error:", error);
            setError("We couldn't connect to the server. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Navbar/>
            <main className="register-page auth-page">
                <div className="register-card auth-card">
                    <div className="auth-heading">
                        <h1>Create your account</h1>
                        <p className="register-subtitle auth-subtitle">
                            A few details are all it takes to start practicing.
                        </p>
                    </div>
                    {error && <p className="auth-error" role="alert">{error}</p>}

                    <form onSubmit={handleRegister}>
                        <div className="form-group">
                            <label htmlFor="register-username">Full name</label>
                            <input
                                id="register-username"
                                type="text"
                                autoComplete="name"
                                placeholder="Enter your name"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="register-email">Email address</label>
                            <input
                                id="register-email"
                                type="email"
                                autoComplete="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="register-password">Password</label>
                            <input
                                id="register-password"
                                type="password"
                                placeholder="Create a password"
                                autoComplete="new-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="register-btn auth-submit" disabled={submitting}>
                            {submitting ? "Creating account..." : "Create account"}
                        </button>
                    </form>

                    <p className="login-text auth-switch">
                        Already have an account?
                        <Link to="/login"> Sign in</Link>
                    </p>
                </div>
            </main>
        </>
    );
}

export default Register;