import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const MainLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const navItems = [
        { label: "Dashboard", path: "/", description: "Overview and quick actions" },
        { label: "Users", path: "/users", description: "Team accounts and access" },
        { label: "Companies", path: "/companies", description: "Client organization list" },
        {
            label: "Company Emails",
            path: "/company-emails",
            description: "Contacts inside each company",
        },
        { label: "Drafts", path: "/drafts", description: "Reusable email content" },
        { label: "Attachments", path: "/attachments", description: "Files linked to drafts" },
        { label: "Outlook", path: "/outlook", description: "Mailbox connection status" },
        { label: "Send Mail", path: "/send-mail", description: "Compose and preview delivery" },
    ];

    const activeItem =
        navItems.find((item) => item.path === location.pathname) ?? navItems[0];

    return (
        <div className="app-shell">
            <aside className="app-sidebar">
                <div className="app-sidebar__brand">
                    <span className="app-sidebar__eyebrow">Mail Management System</span>
                    <h2 className="app-sidebar__title">MailFlow Desk</h2>
                    <p className="app-sidebar__subtitle">
                        A warmer, full-width workspace for managing drafts, contacts, and
                        Outlook delivery.
                    </p>
                </div>

                <div className="app-sidebar__meta">
                    <span className="app-sidebar__eyebrow">Workspace Focus</span>
                    <strong>Desktop-first layout</strong>
                    <p>
                        Wide reading space on larger screens, with responsive stacking for
                        tablets and phones.
                    </p>
                </div>

                <nav className="app-sidebar__nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === "/"}
                            className={({ isActive }) =>
                                `app-nav-link${isActive ? " app-nav-link--active" : ""}`
                            }
                        >
                            <span>{item.label}</span>
                            <small>{item.description}</small>
                        </NavLink>
                    ))}
                </nav>

                <div className="app-sidebar__footer">
                    <span className="app-sidebar__eyebrow">Signed In</span>
                    <strong>{user?.name}</strong>
                    <p>{user?.email}</p>
                </div>
            </aside>

            <div className="app-content">
                <header className="app-topbar">
                    <div className="app-topbar__meta">
                        <span className="app-topbar__eyebrow">Current Section</span>
                        <div className="app-topbar__title">{activeItem.label}</div>
                    </div>

                    <div className="app-user-chip">
                        <div className="app-user-chip__identity">
                            <strong>{user?.name}</strong>
                            <span className="muted">{user?.email}</span>
                        </div>
                        <span className="app-user-chip__badge">{user?.role}</span>
                        <button type="button" className="button button--secondary" onClick={logout}>
                            Logout
                        </button>
                    </div>
                </header>

                <main className="app-main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
