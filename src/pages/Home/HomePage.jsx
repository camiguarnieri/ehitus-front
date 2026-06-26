import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box, Typography, Card, CardContent, CircularProgress,
    Grid, Chip, useMediaQuery, useTheme
} from "@mui/material";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ApartmentIcon from "@mui/icons-material/Apartment";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AssessmentIcon from "@mui/icons-material/Assessment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { getDashboard } from "../../api/apiCalls";

const accesos = [
    { label: "Carga horaria", path: "/carga-horaria", icon: <AccessTimeIcon sx={{ fontSize: 28 }} />, desc: "Cargá las horas del día" },
    { label: "Reporte", path: "/reporte", icon: <AssessmentIcon sx={{ fontSize: 28 }} />, desc: "Consultar reportes" },
];

export default function HomePage() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const nombre = localStorage.getItem("nombre") || "Usuario";

    const [resumen, setResumen] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDashboard()
            .then((res) => setResumen(res.data))
            .catch((err) => {
                console.log('Error dashboard:', err);
                setResumen(null);
            })
            .finally(() => setLoading(false));
    }, []);
    const hoy = new Date().toLocaleDateString("es-UY", {
        weekday: "long", day: "numeric", month: "long"
    });

    return (
        <Box>
            {/* Saludo */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                    Hola, {nombre}
                </Typography>
                <Typography color="text.secondary" fontSize="0.9rem" sx={{ textTransform: "capitalize" }}>
                    {hoy}
                </Typography>
            </Box>

            {/* Tarjetas de resumen */}
            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : resumen && (
                <Box sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
                    gap: 2,
                    mb: 4,
                }}>
                    {/* Funcionarios a cargo */}
                    <Card variant="outlined" onClick={() => navigate("/funcionarios")} sx={{ borderRadius: 3, cursor: "pointer", "&:hover": { borderColor: "#E8630A" } }}>
                        <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <Box>
                                    <Typography color="text.secondary" fontSize="0.78rem" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                                        Funcionarios
                                    </Typography>
                                    <Typography variant="h4" fontWeight={800} mt={0.5}>
                                        {resumen.funcionariosACargo}
                                    </Typography>
                                    <Typography color="text.secondary" fontSize="0.78rem" mt={0.25}>
                                        a tu cargo
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    width: 44, height: 44, borderRadius: 2,
                                    backgroundColor: "rgba(232,99,10,0.1)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    <PeopleAltIcon sx={{ color: "#E8630A", fontSize: 22 }} />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Obras activas */}
                    <Card variant="outlined" onClick={() => navigate("/obras")} sx={{ borderRadius: 3, cursor: "pointer", "&:hover": { borderColor: "#E8630A" } }}>
                        <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <Box>
                                    <Typography color="text.secondary" fontSize="0.78rem" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                                        Obras
                                    </Typography>
                                    <Typography variant="h4" fontWeight={800} mt={0.5}>
                                        {resumen.obrasActivas}
                                    </Typography>
                                    <Typography color="text.secondary" fontSize="0.78rem" mt={0.25}>
                                        en ejecución
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    width: 44, height: 44, borderRadius: 2,
                                    backgroundColor: "rgba(232,99,10,0.1)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    <ApartmentIcon sx={{ color: "#E8630A", fontSize: 22 }} />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Último día cargado */}
                    <Card variant="outlined" sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <Box>
                                    <Typography color="text.secondary" fontSize="0.78rem" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                                        Última carga
                                    </Typography>
                                    <Typography variant="h6" fontWeight={800} mt={0.5} fontSize="1rem">
                                        {resumen.ultimaFecha
                                            ? new Date(resumen.ultimaFecha + "T12:00:00").toLocaleDateString("es-UY", { day: "numeric", month: "short" })
                                            : "Sin cargas"}
                                    </Typography>
                                    <Typography color="text.secondary" fontSize="0.78rem" mt={0.25}>
                                        {resumen.ultimaFecha ? "último registro" : "todavía"}
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    width: 44, height: 44, borderRadius: 2,
                                    backgroundColor: "rgba(232,99,10,0.1)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    <AccessTimeIcon sx={{ color: "#E8630A", fontSize: 22 }} />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Cargado hoy */}
                    <Card variant="outlined" sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <Box>
                                    <Typography color="text.secondary" fontSize="0.78rem" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                                        Hoy
                                    </Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Chip
                                            size="small"
                                            icon={resumen.cargadoHoy
                                                ? <CheckCircleIcon sx={{ fontSize: "16px !important" }} />
                                                : <WarningAmberIcon sx={{ fontSize: "16px !important" }} />}
                                            label={resumen.cargadoHoy ? "Cargado" : "Sin cargar"}
                                            color={resumen.cargadoHoy ? "success" : "warning"}
                                            sx={{ fontWeight: 600 }}
                                        />
                                    </Box>
                                    <Typography color="text.secondary" fontSize="0.78rem" mt={0.75}>
                                        {resumen.cargadoHoy ? "ya registraste horas" : "todavía no cargaste"}
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    width: 44, height: 44, borderRadius: 2,
                                    backgroundColor: resumen.cargadoHoy ? "rgba(46,125,50,0.1)" : "rgba(237,108,2,0.1)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    {resumen.cargadoHoy
                                        ? <CheckCircleIcon sx={{ color: "success.main", fontSize: 22 }} />
                                        : <WarningAmberIcon sx={{ color: "warning.main", fontSize: 22 }} />}
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            )}

            {/* Accesos rápidos */}
            <Typography variant="subtitle2" fontWeight={700} color="text.secondary"
                textTransform="uppercase" letterSpacing={0.5} mb={2}>
                Accesos rápidos
            </Typography>
            <Box sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
                gap: 2,
            }}>
                {accesos.map((a) => (
                    <Card
                        key={a.path}
                        variant="outlined"
                        onClick={() => navigate(a.path)}
                        sx={{
                            borderRadius: 3, cursor: "pointer",
                            transition: "all 0.15s",
                            "&:hover": {
                                borderColor: "#E8630A",
                                boxShadow: "0 4px 16px rgba(232,99,10,0.12)",
                                transform: "translateY(-2px)",
                            },
                        }}
                    >
                        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1, p: "20px !important" }}>
                            <Box sx={{
                                width: 48, height: 48, borderRadius: 2,
                                backgroundColor: "rgba(232,99,10,0.08)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "#E8630A",
                            }}>
                                {a.icon}
                            </Box>
                            <Typography fontWeight={700} fontSize="0.95rem">{a.label}</Typography>
                            <Typography color="text.secondary" fontSize="0.8rem">{a.desc}</Typography>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        </Box>
    );
}