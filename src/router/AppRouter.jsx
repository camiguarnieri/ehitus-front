import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/Login/LoginPage";
import Layout from "../components/Layout";
import FuncionariosPage from "../pages/Funcionarios/FuncionariosPage";
import ObrasPage from "../pages/Obras/ObrasPage";
import ParametrosCargaHorariaPage from "../pages/Parametros/ParametrosCargaHorariaPage";

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
                <Route path="/funcionarios" element={<PrivateRoute><FuncionariosPage /></PrivateRoute>} />
                <Route path="/obras" element={<PrivateRoute><ObrasPage /></PrivateRoute>} />
                <Route path="/parametros-carga" element={<PrivateRoute><ParametrosCargaHorariaPage /></PrivateRoute>} />

            </Routes>
        </BrowserRouter>
    );
}