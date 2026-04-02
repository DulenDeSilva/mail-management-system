import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { createUserRequest, deactivateUserRequest, getUsersRequest } from "../api/usersApi";
import { useAuth } from "../context/AuthContext";
import type { AppUser } from "../types/user";

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

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await getUsersRequest();
            setUsers(data);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
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
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to create user");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeactivate = async (userId: number) => {
        try {
            await deactivateUserRequest(userId);
            await loadUsers();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to deactivate user");
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
                                            <td>{item.name}</td>
                                            <td>{item.email}</td>
                                            <td>
                                                <span className="badge">{item.role}</span>
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
