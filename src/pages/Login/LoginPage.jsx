import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    TextField,
    Button,
    Typography,
    CircularProgress,
    Alert,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
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
            localStorage.setItem("rol", data.data.rol);

            navigate("/");
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                "Usuario o contraseña incorrectos"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                backgroundColor: "#111111",
            }}
        >
            {/* Panel izquierdo */}
            <Box
                sx={{
                    display: { xs: "none", md: "flex" },
                    flex: 1,
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#171717",
                    borderRight: "1px solid #2A2A2A",
                    p: 6,
                    color: "#fff",
                }}
            >
                <Box
                    sx={{
                        width: 72,
                        height: 72,
                        borderRadius: 3,
                        backgroundColor: "#E8630A",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 3,
                    }}
                >
                    <LockOutlinedIcon
                        sx={{
                            color: "#fff",
                            fontSize: 34,
                        }}
                    />
                </Box>

                <Typography
                    variant="h3"
                    sx={{
                        color: "#fff",
                        fontWeight: 700,
                        mb: 1,
                    }}
                >
                    Ehitus
                </Typography>

                <Typography
                    sx={{
                        color: "#B8B8B8",
                        textAlign: "center",
                        fontSize: "1rem",
                        maxWidth: 420,
                        lineHeight: 1.6,
                    }}
                >
                    Sistema de control de personal y carga horaria para obras de
                    construcción
                </Typography>

                <Box
                    sx={{
                        mt: 7,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        width: "100%",
                        maxWidth: 350,
                    }}
                >
                    {[
                        "Carga horaria diaria",
                        "Control por supervisor",
                        "Reportes de obra",
                    ].map((item) => (
                        <Box
                            key={item}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                backgroundColor: "#202020",
                                borderRadius: 3,
                                px: 3,
                                py: 2,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    backgroundColor: "#E8630A",
                                    flexShrink: 0,
                                }}
                            />

                            <Typography
                                sx={{
                                    color: "#E0E0E0",
                                    fontSize: "0.95rem",
                                    fontWeight: 400,
                                }}
                            >
                                {item}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Panel derecho */}
            <Box
                sx={{
                    flex: { xs: 1, md: "0 0 500px" },
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    px: { xs: 3, sm: 6 },
                }}
            >
                <Box
                    sx={{
                        width: "100%",
                        maxWidth: 380,
                    }}
                >
                    {/* Mobile Logo */}
                    <Box
                        sx={{
                            display: { xs: "flex", md: "none" },
                            flexDirection: "column",
                            alignItems: "center",
                            mb: 5,
                        }}
                    >
                        <Box
                            sx={{
                                width: 60,
                                height: 60,
                                borderRadius: 3,
                                backgroundColor: "#E8630A",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mb: 2,
                            }}
                        >
                            <LockOutlinedIcon
                                sx={{
                                    color: "#fff",
                                    fontSize: 30,
                                }}
                            />
                        </Box>

                        <Typography
                            variant="h5"
                            sx={{
                                color: "#fff",
                                fontWeight: 700,
                            }}
                        >
                            Ehitus
                        </Typography>
                    </Box>

                    <Typography
                        sx={{
                            color: "#FFFFFF",
                            fontSize: "2rem",
                            fontWeight: 600,
                            mb: 1,
                        }}
                    >
                        Bienvenido
                    </Typography>

                    <Typography
                        sx={{
                            color: "#B8B8B8",
                            fontSize: "0.95rem",
                            mb: 4,
                        }}
                    >
                        Ingresá tus credenciales para continuar
                    </Typography>

                    <Box
                        component="form"
                        onSubmit={handleLogin}
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                        }}
                    >
                        {error && (
                            <Alert
                                severity="error"
                                sx={{
                                    borderRadius: 2,
                                }}
                            >
                                {error}
                            </Alert>
                        )}

                        <TextField
                            label="Usuario"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            required
                            fullWidth
                            autoComplete="username"
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    color: "#fff",
                                    backgroundColor: "#111111",

                                    "& input": {
                                        color: "#fff",
                                        WebkitTextFillColor: "#fff", // Chrome
                                    },

                                    "& fieldset": {
                                        borderColor: "#333",
                                    },

                                    "&:hover fieldset": {
                                        borderColor: "#666",
                                    },

                                    "&.Mui-focused fieldset": {
                                        borderColor: "#E8630A",
                                    },
                                },

                                "& .MuiInputLabel-root": {
                                    color: "#B8B8B8",
                                },

                                "& .MuiInputLabel-root.Mui-focused": {
                                    color: "#E8630A",
                                },
                            }}
                        />

                        <TextField
                            label="Contraseña"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            fullWidth
                            autoComplete="current-password"
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    color: "#fff",
                                    backgroundColor: "#111111",

                                    "& input": {
                                        color: "#fff",
                                        WebkitTextFillColor: "#fff",
                                    },

                                    "& fieldset": {
                                        borderColor: "#333",
                                    },

                                    "&:hover fieldset": {
                                        borderColor: "#666",
                                    },

                                    "&.Mui-focused fieldset": {
                                        borderColor: "#E8630A",
                                    },
                                },

                                "& .MuiInputLabel-root": {
                                    color: "#B8B8B8",
                                },

                                "& .MuiInputLabel-root.Mui-focused": {
                                    color: "#E8630A",
                                },
                            }}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={loading}
                            sx={{
                                mt: 1,
                                py: 1.5,
                                borderRadius: 3,
                                backgroundColor: "#E8630A",
                                fontWeight: 700,
                                fontSize: "1rem",
                                textTransform: "none",
                                boxShadow: "none",
                                "&:hover": {
                                    backgroundColor: "#D85700",
                                    boxShadow: "none",
                                },
                            }}
                        >
                            {loading ? (
                                <CircularProgress
                                    size={22}
                                    sx={{ color: "#fff" }}
                                />
                            ) : (
                                "Ingresar"
                            )}
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}