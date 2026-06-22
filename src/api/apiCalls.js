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

// FUNCIONARIOS
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