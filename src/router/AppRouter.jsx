import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/Login/LoginPage";
import Layout from "../components/Layout";
import FuncionariosPage from "../pages/Funcionarios/FuncionariosPage";
import ObrasPage from "../pages/Obras/ObrasPage";
import ParametrosCargaHorariaPage from "../pages/Parametros/ParametrosCargaHorariaPage";
import ParametrosCierreMesPage from "../pages/Parametros/ParametrosCierreMesPage";
import CargaHorariaPage from "../pages/CargaHoraria/CargaHorariaPage";
import UsuariosPage from "../pages/Usuarios/UsuariosPage";
import ReportePage from "../pages/Reporte/ReportePage";
import HomePage from "../pages/Home/HomePage";
import ControlCargaPage from "../pages/ControlCarga/ControlCargaPage";
import CargaFuncionarioPage from "../pages/CargaFuncionario/CargaFuncionarioPage";

const isTokenValido = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;
    try {
        const jwt = token.split("_").slice(1).join("_");
        const payload = JSON.parse(atob(jwt.split(".")[1]));
        return payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
};

const PrivateRoute = ({ children }) => {
    if (!isTokenValido()) {
        localStorage.clear();
        return <Navigate to="/login" />;
    }
    return <Layout>{children}</Layout>;
};

export default function AppRouter() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/funcionarios" element={<PrivateRoute><FuncionariosPage /></PrivateRoute>} />
                <Route path="/usuarios" element={<PrivateRoute><UsuariosPage /></PrivateRoute>} />
                <Route path="/obras" element={<PrivateRoute><ObrasPage /></PrivateRoute>} />
                <Route path="/parametros-carga" element={<PrivateRoute><ParametrosCargaHorariaPage /></PrivateRoute>} />
                <Route path="/parametros-cierre" element={<PrivateRoute><ParametrosCierreMesPage /></PrivateRoute>} />
                <Route path="/carga-horaria" element={<PrivateRoute><CargaHorariaPage /></PrivateRoute>} />
                <Route path="/reporte" element={<PrivateRoute><ReportePage /></PrivateRoute>} />
                <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
                <Route path="/control-carga" element={<PrivateRoute><ControlCargaPage /></PrivateRoute>} />
                <Route path="/carga-funcionario" element={<PrivateRoute><CargaFuncionarioPage /></PrivateRoute>} />
            </Routes>
        </HashRouter>
    );
}
