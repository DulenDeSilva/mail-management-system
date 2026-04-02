import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
    const { user } = useAuth();
    const firstName = user?.name?.split(" ")[0] || "Team";

    return (
        <div className="page-shell">
            <section className="hero-grid">
                <div className="hero-card">
                    <span className="eyebrow">Operations Overview</span>
                    <h1>Welcome back, {firstName}.</h1>
                    <p>
                        Keep users, companies, drafts, attachments, and Outlook delivery in
                        one calmer workspace built for wide desktop screens and responsive
                        follow-up on smaller devices.
                    </p>

                    <div className="button-group section-heading">
                        <Link to="/send-mail" className="button">
                            Open Send Mail
                        </Link>
                        <Link to="/drafts" className="button button--secondary">
                            Review Drafts
                        </Link>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel__header">
                        <div>
                            <span className="eyebrow">Profile Snapshot</span>
                            <h2>Active session</h2>
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
                            <span className="badge">{user?.role || "-"}</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-card__value">Wide</div>
                    <div className="metric-card__label">
                        Desktop canvas with more breathing room for form and table-heavy pages.
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-card__value">Warm</div>
                    <div className="metric-card__label">
                        Off-white surfaces with `#343148` as the anchor color for contrast.
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-card__value">Responsive</div>
                    <div className="metric-card__label">
                        Panels stack cleanly so the same workflows remain usable on phones and
                        tablets.
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DashboardPage;
