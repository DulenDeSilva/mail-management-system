import { FormEvent, useEffect, useState } from "react";
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
        return <p>You do not have permission to view this page.</p>;
    }

    return (
        <div>
            <h1>Users</h1>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 2fr",
                    gap: 24,
                    alignItems: "start",
                }}
            >
                <div
                    style={{
                        border: "1px solid #334155",
                        padding: 16,
                        borderRadius: 8,
                    }}
                >
                    <h2>Create User</h2>

                    <form onSubmit={handleCreateUser}>
                        <div style={{ marginBottom: 12 }}>
                            <label>Name</label>
                            <input
                                style={{ width: "100%", padding: 8 }}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div style={{ marginBottom: 12 }}>
                            <label>Email</label>
                            <input
                                type="email"
                                style={{ width: "100%", padding: 8 }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div style={{ marginBottom: 12 }}>
                            <label>Password</label>
                            <input
                                type="password"
                                style={{ width: "100%", padding: 8 }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div style={{ marginBottom: 12 }}>
                            <label>Role</label>
                            <select
                                style={{ width: "100%", padding: 8 }}
                                value={role}
                                onChange={(e) => setRole(e.target.value as "ADMIN" | "WORKER")}
                            >
                                <option value="WORKER">WORKER</option>
                                <option value="ADMIN">ADMIN</option>
                            </select>
                        </div>

                        <button type="submit" disabled={submitting}>
                            {submitting ? "Creating..." : "Create User"}
                        </button>
                    </form>
                </div>

                <div
                    style={{
                        border: "1px solid #334155",
                        padding: 16,
                        borderRadius: 8,
                    }}
                >
                    <h2>User List</h2>

                    {error && <p style={{ color: "#f87171" }}>{error}</p>}

                    {loading ? (
                        <p>Loading users...</p>
                    ) : users.length === 0 ? (
                        <p>No users found.</p>
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: "left", padding: 8 }}>Name</th>
                                    <th style={{ textAlign: "left", padding: 8 }}>Email</th>
                                    <th style={{ textAlign: "left", padding: 8 }}>Role</th>
                                    <th style={{ textAlign: "left", padding: 8 }}>Status</th>
                                    <th style={{ textAlign: "left", padding: 8 }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((item) => (
                                    <tr key={item.id}>
                                        <td style={{ padding: 8 }}>{item.name}</td>
                                        <td style={{ padding: 8 }}>{item.email}</td>
                                        <td style={{ padding: 8 }}>{item.role}</td>
                                        <td style={{ padding: 8 }}>
                                            {item.isActive ? "Active" : "Inactive"}
                                        </td>
                                        <td style={{ padding: 8 }}>
                                            {item.isActive ? (
                                                <button onClick={() => handleDeactivate(item.id)}>
                                                    Deactivate
                                                </button>
                                            ) : (
                                                <span>—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UsersPage;