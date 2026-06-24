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

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    return token ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

export default function AppRouter() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<PrivateRoute><div>Home</div></PrivateRoute>} />
                <Route path="/funcionarios" element={<PrivateRoute><FuncionariosPage /></PrivateRoute>} />
                <Route path="/usuarios" element={<PrivateRoute><UsuariosPage /></PrivateRoute>} />
                <Route path="/obras" element={<PrivateRoute><ObrasPage /></PrivateRoute>} />
                <Route path="/parametros-carga" element={<PrivateRoute><ParametrosCargaHorariaPage /></PrivateRoute>} />
                <Route path="/parametros-cierre" element={<PrivateRoute><ParametrosCierreMesPage /></PrivateRoute>} />
                <Route path="/carga-horaria" element={<PrivateRoute><CargaHorariaPage /></PrivateRoute>} />
                <Route path="/reporte" element={<PrivateRoute><ReportePage /></PrivateRoute>} />
            </Routes>
        </HashRouter>
    );
}
