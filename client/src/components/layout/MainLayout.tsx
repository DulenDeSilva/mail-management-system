import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const MainLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const navItems = [
        { label: "Dashboard", path: "/" },
        { label: "Users", path: "/users" },
        { label: "Companies", path: "/companies" },
        { label: "Company Emails", path: "/company-emails" },
        { label: "Drafts", path: "/drafts" },
        { label: "Attachments", path: "/attachments" },
        { label: "Outlook", path: "/outlook" },
        { label: "Send Mail", path: "/send-mail" },
    ];
    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            <aside
                style={{
                    width: 240,
                    background: "#111827",
                    color: "#fff",
                    padding: 20,
                }}
            >
                <h2 style={{ marginBottom: 24 }}>Mail System</h2>

                <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            style={{
                                color: location.pathname === item.path ? "#60a5fa" : "#fff",
                                textDecoration: "none",
                                padding: "8px 0",
                            }}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </aside>

            <div style={{ flex: 1, background: "#0f172a", color: "#fff" }}>
                <header
                    style={{
                        padding: "16px 24px",
                        borderBottom: "1px solid #1e293b",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <div>
                        <strong>{user?.name}</strong> ({user?.role})
                    </div>
                    <button onClick={logout}>Logout</button>
                </header>

                <main style={{ padding: 24 }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;