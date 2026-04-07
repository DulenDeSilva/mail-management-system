import axios from "axios";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
    createUserRequest,
    deactivateUserRequest,
    getUsersRequest,
    updateUserRequest
} from "../api/usersApi";
import { useAuth } from "../context/AuthContext";
import type { AppUser } from "../types/user";

type ApiErrorResponse = { message?: string };

const getErrorMessage = (error: unknown, fallback: string) => {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message || fallback;
    }

    return fallback;
};

const UsersPage = () => {
    const { user } = useAuth();

    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<"ADMIN" | "WORKER">("WORKER");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState("");
    const [editingEmail, setEditingEmail] = useState("");
    const [editingRole, setEditingRole] = useState<"ADMIN" | "WORKER">("WORKER");

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await getUsersRequest();
            setUsers(data);
        } catch (error: unknown) {
            setError(getErrorMessage(error, "Failed to load users"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadUsers();
    }, []);

    const handleCreateUser = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            setSubmitting(true);
            await createUserRequest({
                name,
                email,
                password,
                role,
            });

            setName("");
            setEmail("");
            setPassword("");
            setRole("WORKER");

            await loadUsers();
        } catch (error: unknown) {
            setError(getErrorMessage(error, "Failed to create user"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleStartEdit = (selectedUser: AppUser) => {
        setEditingId(selectedUser.id);
        setEditingName(selectedUser.name);
        setEditingEmail(selectedUser.email);
        setEditingRole(selectedUser.role);
        setError("");
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingName("");
        setEditingEmail("");
        setEditingRole("WORKER");
    };

    const handleSaveEdit = async (userId: number) => {
        try {
            setError("");
            await updateUserRequest(userId, {
                name: editingName,
                email: editingEmail,
                role: editingRole
            });
            handleCancelEdit();
            await loadUsers();
        } catch (error: unknown) {
            setError(getErrorMessage(error, "Failed to update user"));
        }
    };

    const handleDeactivate = async (userId: number) => {
        try {
            setError("");
            await deactivateUserRequest(userId);
            await loadUsers();
        } catch (error: unknown) {
            setError(getErrorMessage(error, "Failed to deactivate user"));
        }
    };

    if (user?.role !== "ADMIN") {
        return (
            <div className="page-shell">
                <div className="message message--info">
                    You do not have permission to view this page.
                </div>
            </div>
        );
    }

    const activeUsers = users.filter((item) => item.isActive).length;

    return (
        <div className="page-shell">
            <div className="page-header">
                <div className="page-header__copy">
                    <span className="eyebrow">Administration</span>
                    <h1 className="page-title">Users</h1>
                    <p className="page-subtitle">
                        Add team members, assign roles, and keep access to the mail workflow
                        controlled.
                    </p>
                </div>

                <div className="page-actions">
                    <span className="badge">{users.length} total users</span>
                    <span className="badge badge--success">{activeUsers} active</span>
                </div>
            </div>

            {error && <div className="message message--error">{error}</div>}

            <div className="split-layout">
                <section className="panel">
                    <div className="panel__header">
                        <div>
                            <span className="eyebrow">Create Account</span>
                            <h2>Add a new user</h2>
                        </div>
                    </div>

                    <form className="form-grid" onSubmit={handleCreateUser}>
                        <div className="field">
                            <label htmlFor="user-name">Name</label>
                            <input
                                id="user-name"
                                className="input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="user-email">Email</label>
                            <input
                                id="user-email"
                                type="email"
                                className="input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="user-password">Password</label>
                            <input
                                id="user-password"
                                type="password"
                                className="input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="user-role">Role</label>
                            <select
                                id="user-role"
                                className="select"
                                value={role}
                                onChange={(e) => setRole(e.target.value as "ADMIN" | "WORKER")}
                            >
                                <option value="WORKER">WORKER</option>
                                <option value="ADMIN">ADMIN</option>
                            </select>
                        </div>

                        <button type="submit" className="button" disabled={submitting}>
                            {submitting ? "Creating..." : "Create User"}
                        </button>
                    </form>
                </section>

                <section className="panel">
                    <div className="panel__header">
                        <div>
                            <span className="eyebrow">Directory</span>
                            <h2>Team members</h2>
                        </div>
                        <span className="badge badge--warm">Role-based access</span>
                    </div>

                    {loading ? (
                        <div className="empty-state">Loading users...</div>
                    ) : users.length === 0 ? (
                        <div className="empty-state">No users found.</div>
                    ) : (
                        <div className="table-wrap">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                {editingId === item.id ? (
                                                    <input
                                                        className="input"
                                                        value={editingName}
                                                        onChange={(e) => setEditingName(e.target.value)}
                                                    />
                                                ) : (
                                                    item.name
                                                )}
                                            </td>
                                            <td>
                                                {editingId === item.id ? (
                                                    <input
                                                        type="email"
                                                        className="input"
                                                        value={editingEmail}
                                                        onChange={(e) => setEditingEmail(e.target.value)}
                                                    />
                                                ) : (
                                                    item.email
                                                )}
                                            </td>
                                            <td>
                                                {editingId === item.id ? (
                                                    <select
                                                        className="select"
                                                        value={editingRole}
                                                        onChange={(e) =>
                                                            setEditingRole(
                                                                e.target.value as "ADMIN" | "WORKER"
                                                            )
                                                        }
                                                    >
                                                        <option value="WORKER">WORKER</option>
                                                        <option value="ADMIN">ADMIN</option>
                                                    </select>
                                                ) : (
                                                    <span className="badge">{item.role}</span>
                                                )}
                                            </td>
                                            <td>
                                                <span
                                                    className={`badge ${
                                                        item.isActive
                                                            ? "badge--success"
                                                            : "badge--danger"
                                                    }`}
                                                >
                                                    {item.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td>
                                                {editingId === item.id ? (
                                                    <div className="table-actions">
                                                        <button
                                                            type="button"
                                                            className="button button--small"
                                                            onClick={() => handleSaveEdit(item.id)}
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="button button--ghost button--small"
                                                            onClick={handleCancelEdit}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="table-actions">
                                                        <button
                                                            type="button"
                                                            className="button button--secondary button--small"
                                                            onClick={() => handleStartEdit(item)}
                                                        >
                                                            Edit
                                                        </button>
                                                        {item.isActive ? (
                                                            <button
                                                                type="button"
                                                                className="button button--danger button--small"
                                                                onClick={() => handleDeactivate(item.id)}
                                                            >
                                                                Deactivate
                                                            </button>
                                                        ) : (
                                                            <span className="muted">Already inactive</span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default UsersPage;
