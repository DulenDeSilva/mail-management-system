import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import UsersPage from "../pages/UsersPage";
import CompaniesPage from "../pages/CompaniesPage";
import CompanyEmailsPage from "../pages/CompanyEmailsPage";
import DraftsPage from "../pages/DraftsPage";
import AttachmentsPage from "../pages/AttachmentsPage";
import SendMailPage from "../pages/SendMailPage";
import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../components/layout/MainLayout";

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<MainLayout />}>
                        <Route index element={<DashboardPage />} />
                        <Route path="users" element={<UsersPage />} />
                        <Route path="companies" element={<CompaniesPage />} />
                        <Route path="company-emails" element={<CompanyEmailsPage />} />
                        <Route path="drafts" element={<DraftsPage />} />
                        <Route path="attachments" element={<AttachmentsPage />} />
                        <Route path="send-mail" element={<SendMailPage />} />
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;
