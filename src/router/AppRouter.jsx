import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/Login/LoginPage";
import Layout from "../components/Layout";

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    return token ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<PrivateRoute><div>Home</div></PrivateRoute>} />
            </Routes>
        </BrowserRouter>
    );
}