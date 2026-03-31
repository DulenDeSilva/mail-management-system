import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
    const { user } = useAuth();

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Welcome, {user?.name}</p>
            <p>Email: {user?.email}</p>
            <p>Role: {user?.role}</p>
        </div>
    );
};

export default DashboardPage;