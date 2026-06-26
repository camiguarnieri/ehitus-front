import { ehitusApi } from "./api";

export const login = async (usuario, password) => {
    try {
        const response = await ehitusApi.post("/usuarios/login", { usuario, password });
        return response.data;
    } catch (error) {
        console.error("Error en login:", error);
        throw error;
    }
};

// EMPRESAS
export const getEmpresas = async () => {
    try {
        const response = await ehitusApi.get("/empresas");
        return response.data;
    } catch (error) {
        console.error("Error obteniendo empresas:", error);
        throw error;
    }
};

// USUARIOS
export const getUsuarios = async () => {
    try {
        const response = await ehitusApi.get("/usuarios");
        return response.data;
    } catch (error) {
        console.error("Error obteniendo usuarios:", error);
        throw error;
    }
};

export const createUsuario = async (usuario) => {
    try {
        const response = await ehitusApi.post("/usuarios", usuario);
        return response.data;
    } catch (error) {
        console.error("Error creando usuario:", error);
        throw error;
    }
};

export const updateUsuario = async (id, usuario) => {
    try {
        const response = await ehitusApi.put(`/usuarios/${id}`, usuario);
        return response.data;
    } catch (error) {
        console.error("Error actualizando usuario:", error);
        throw error;
    }
};

export const deleteUsuario = async (id) => {
    try {
        const response = await ehitusApi.delete(`/usuarios/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error dando de baja usuario:", error);
        throw error;
    }
};

// FUNCIONARIOS
export const getFuncionarios = async () => {
    try {
        const response = await ehitusApi.get("/funcionarios");
        return response.data;
    } catch (error) {
        console.error("Error obteniendo funcionarios:", error);
        throw error;
    }
};

export const createFuncionario = async (funcionario) => {
    try {
        const response = await ehitusApi.post("/funcionarios", funcionario);
        return response.data;
    } catch (error) {
        console.error("Error creando funcionario:", error);
        throw error;
    }
};

export const getTodosFuncionarios = async () => {
    try {
        const response = await ehitusApi.get("/funcionarios/todos");
        return response.data;
    } catch (error) {
        console.error("Error obteniendo todos los funcionarios:", error);
        throw error;
    }
};

// OBRAS
export const getObras = async () => {
    try {
        const response = await ehitusApi.get("/obras");
        return response.data;
    } catch (error) {
        console.error("Error obteniendo obras:", error);
        throw error;
    }
};

// PARAMETROS CARGA HORARIA
export const getParametroCargaHoraria = async () => {
    try {
        const response = await ehitusApi.get("/parametros-carga-horaria");
        return response.data;
    } catch (error) {
        console.error("Error obteniendo parámetros carga horaria:", error);
        throw error;
    }
};

export const saveParametroCargaHoraria = async (data) => {
    try {
        const response = await ehitusApi.post("/parametros-carga-horaria", data);
        return response.data;
    } catch (error) {
        console.error("Error guardando parámetros carga horaria:", error);
        throw error;
    }
};

// PASOS CIERRE HORAS
export const getPasosCierreHoras = async () => {
    try {
        const response = await ehitusApi.get("/pasos-cierre-horas");
        return response.data;
    } catch (error) {
        console.error("Error obteniendo pasos cierre horas:", error);
        throw error;
    }
};

export const savePasosCierreHoras = async (data) => {
    try {
        const response = await ehitusApi.post("/pasos-cierre-horas", data);
        return response.data;
    } catch (error) {
        console.error("Error guardando pasos cierre horas:", error);
        throw error;
    }
};

// PLANILLA HS
export const getPlanillaHs = async (fecha, numObra) => {
    try {
        const response = await ehitusApi.get(`/planilla-hs?fecha=${fecha}&numObra=${numObra}`);
        return response.data;
    } catch (error) {
        console.error("Error obteniendo planilla:", error);
        throw error;
    }
};

export const savePlanillaHs = async (registros) => {
    try {
        const response = await ehitusApi.post("/planilla-hs", { registros });
        return response.data;
    } catch (error) {
        console.error("Error guardando planilla:", error);
        throw error;
    }
};

// REPORTE
export const getReporte = async (params) => {
    try {
        const query = new URLSearchParams(params).toString();
        const response = await ehitusApi.get(`/reporte?${query}`);
        return response.data;
    } catch (error) {
        console.error("Error obteniendo reporte:", error);
        throw error;
    }
};

// SUPERVISOR - FUNCIONARIO
export const getFuncionariosPorSupervisor = async (idUsuario) => {
    try {
        const response = await ehitusApi.get(`/supervisor-funcionario/${idUsuario}`);
        return response.data;
    } catch (error) {
        console.error("Error obteniendo funcionarios del supervisor:", error);
        throw error;
    }
};

export const setFuncionariosPorSupervisor = async (idUsuario, codigos) => {
    try {
        const response = await ehitusApi.put(`/supervisor-funcionario/${idUsuario}`, { codigos });
        return response.data;
    } catch (error) {
        console.error("Error guardando funcionarios del supervisor:", error);
        throw error;
    }
};

// DASHBOARD
export const getDashboard = async () => {
    try {
        const response = await ehitusApi.get("/dashboard");
        return response.data;
    } catch (error) {
        console.error("Error obteniendo dashboard:", error);
        throw error;
    }
};

// CONTROL DE CARGA
export const getControlCarga = async (fechaDesde, fechaHasta) => {
    try {
        const response = await ehitusApi.get(`/control-carga?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`);
        return response.data;
    } catch (error) {
        console.error("Error obteniendo control de carga:", error);
        throw error;
    }
};