import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../api/apiCalls";

export default function LoginPage() {
    const [usuario, setUsuario] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const data = await login(usuario, password);
            localStorage.setItem("token", data.data.token);
            localStorage.setItem("nombre", data.data.nombre);
            localStorage.setItem("codEmp", data.data.codEmp);
            navigate("/");
        } catch (err) {
            setError(err?.response?.data?.message || "Usuario o contraseña incorrectos");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Ehitus</h2>
                <p style={styles.subtitle}>Control de personal en obra</p>
                <form onSubmit={handleLogin} style={styles.form}>
                    <input
                        style={styles.input}
                        type="text"
                        placeholder="Usuario"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                        required
                    />
                    <input
                        style={styles.input}
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && <p style={styles.error}>{error}</p>}
                    <button style={styles.button} type="submit" disabled={loading}>
                        {loading ? "Ingresando..." : "Ingresar"}
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f0f2f5",
    },
    card: {
        backgroundColor: "#fff",
        padding: "2rem",
        borderRadius: "8px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
        width: "100%",
        maxWidth: "360px",
    },
    title: {
        textAlign: "center",
        marginBottom: "0.25rem",
        color: "#1a1a1a",
    },
    subtitle: {
        textAlign: "center",
        color: "#888",
        marginBottom: "1.5rem",
        fontSize: "0.9rem",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
    },
    input: {
        padding: "0.75rem",
        borderRadius: "6px",
        border: "1px solid #ddd",
        fontSize: "1rem",
        outline: "none",
    },
    button: {
        padding: "0.75rem",
        backgroundColor: "#1976d2",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        fontSize: "1rem",
        cursor: "pointer",
    },
    error: {
        color: "red",
        fontSize: "0.85rem",
        textAlign: "center",
    },
};