import axios from "axios";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { updateMeRequest } from "../api/authApi";
import { useAuth } from "../context/useAuth";
import { getEmailValidationError, normalizeEmail } from "../utils/email";

type ApiErrorResponse = { message?: string };

const getErrorMessage = (error: unknown, fallback: string) => {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message || fallback;
    }

    return fallback;
};

const ProfilePage = () => {
    const { user, setSession } = useAuth();

    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [statusMessage, setStatusMessage] = useState("");

    useEffect(() => {
        setName(user?.name || "");
        setEmail(user?.email || "");
    }, [user?.name, user?.email]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError("");
        setStatusMessage("");

        if (!name.trim() || !email.trim()) {
            setError("Name and email are required");
            return;
        }

        const emailError = getEmailValidationError(email);

        if (emailError) {
            setError(emailError);
            return;
        }

        if (newPassword || currentPassword || confirmPassword) {
            if (!currentPassword || !newPassword) {
                setError("Current password and new password are required to change password");
                return;
            }

            if (newPassword !== confirmPassword) {
                setError("New password and confirmation do not match");
                return;
            }
        }

        try {
            setSubmitting(true);

            const data = await updateMeRequest({
                name: name.trim(),
                email: normalizeEmail(email),
                currentPassword: currentPassword || undefined,
                newPassword: newPassword || undefined
            });

            setSession(data.token, data.user);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setStatusMessage("Profile updated successfully.");
        } catch (updateError: unknown) {
            setError(getErrorMessage(updateError, "Failed to update profile"));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page-shell">
            <div className="page-header">
                <div className="page-header__copy">
                    <span className="eyebrow">Account</span>
                    <h1 className="page-title">Profile</h1>
                    <p className="page-subtitle">
                        Update your own account details and optionally rotate your password.
                        Changes to your name or email refresh the current session immediately.
                    </p>
                </div>

                <div className="page-actions">
                    <span className="badge">{user?.role || "-"}</span>
                </div>
            </div>

            {error && <div className="message message--error">{error}</div>}
            {statusMessage && <div className="message message--info">{statusMessage}</div>}

            <div className="split-layout">
                <section className="panel">
                    <div className="panel__header">
                        <div>
                            <span className="eyebrow">Edit Profile</span>
                            <h2>Your account details</h2>
                        </div>
                    </div>

                    <form className="form-grid" onSubmit={handleSubmit}>
                        <div className="field">
                            <label htmlFor="profile-name">Name</label>
                            <input
                                id="profile-name"
                                className="input"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="profile-email">Email</label>
                            <input
                                id="profile-email"
                                type="email"
                                className="input"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="profile-current-password">Current Password</label>
                            <input
                                id="profile-current-password"
                                type="password"
                                className="input"
                                value={currentPassword}
                                onChange={(event) => setCurrentPassword(event.target.value)}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="profile-new-password">New Password</label>
                            <input
                                id="profile-new-password"
                                type="password"
                                className="input"
                                value={newPassword}
                                onChange={(event) => setNewPassword(event.target.value)}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="profile-confirm-password">Confirm New Password</label>
                            <input
                                id="profile-confirm-password"
                                type="password"
                                className="input"
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                            />
                        </div>

                        <button type="submit" className="button" disabled={submitting}>
                            {submitting ? "Saving..." : "Save Profile"}
                        </button>
                    </form>
                </section>

                <section className="panel">
                    <div className="panel__header">
                        <div>
                            <span className="eyebrow">Session Snapshot</span>
                            <h2>Current session</h2>
                        </div>
                    </div>

                    <div className="summary-stack">
                        <div className="summary-row">
                            <span>Name</span>
                            <strong>{user?.name || "-"}</strong>
                        </div>
                        <div className="summary-row">
                            <span>Email</span>
                            <strong>{user?.email || "-"}</strong>
                        </div>
                        <div className="summary-row">
                            <span>Role</span>
                            <strong>{user?.role || "-"}</strong>
                        </div>
                        <div className="summary-row">
                            <span>Status</span>
                            <strong>{user?.isActive === false ? "Inactive" : "Active"}</strong>
                        </div>
                        <div className="summary-row">
                            <span>Joined</span>
                            <strong>
                                {user?.createdAt
                                    ? new Date(user.createdAt).toLocaleDateString()
                                    : "-"}
                            </strong>
                        </div>
                    </div>

                    <div className="message message--info form-grid--spaced">
                        Leave the password fields empty if you only want to update your name
                        or email.
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ProfilePage;
