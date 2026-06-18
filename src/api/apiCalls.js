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