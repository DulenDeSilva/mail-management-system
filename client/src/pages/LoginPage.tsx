import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("admin@test.com");
    const [password, setPassword] = useState("admin123");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            setSubmitting(true);
            await login(email, password);
            navigate("/");
        } catch (err: any) {
            setError(err?.response?.data?.message || "Login failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="login-shell">
            <div className="login-card">
                <section className="login-card__hero">
                    <span className="eyebrow">Mail Management System</span>
                    <h1>Keep your email operations tidy and ready to send.</h1>
                </section>

                <section className="login-card__panel">
                    <div className="page-header__copy">
                        <span className="eyebrow">Secure Access</span>
                        <h2>Sign in</h2>
                        <p className="page-subtitle">
                            Use your existing credentials to continue into the workspace.
                        </p>
                    </div>

                    {error && <div className="message message--error">{error}</div>}

                    <form className="form-grid" onSubmit={handleSubmit}>
                        <div className="field">
                            <label htmlFor="login-email">Email</label>
                            <input
                                id="login-email"
                                type="email"
                                className="input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="login-password">Password</label>
                            <input
                                id="login-password"
                                type="password"
                                className="input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="button button--full" disabled={submitting}>
                            {submitting ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    <div className="message message--info">
                        Demo defaults are prefilled here for faster UI testing.
                    </div>
                </section>
            </div>
        </div>
    );
};

export default LoginPage;
