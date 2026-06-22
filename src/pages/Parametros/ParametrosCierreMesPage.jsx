import { useEffect, useState } from "react";
import {
    Box, Typography, Button, CircularProgress, Alert, Paper, Divider, Switch, FormControlLabel
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { getPasosCierreHoras, savePasosCierreHoras } from "../../api/apiCalls";

const pasos = [
    { key: "EnEhitus", label: "En Ehitus", description: "El mes está siendo procesado en Ehitus" },
    { key: "CierreMes", label: "Cierre de mes", description: "El cierre del mes fue realizado" },
    { key: "TraspasoMesEhitus", label: "Traspaso mes Ehitus", description: "El traspaso del mes en Ehitus fue completado" },
    { key: "ActualizarObras", label: "Actualizar obras", description: "Se deben actualizar las obras al cerrar el mes" },
];

function formatMes(fecha) {
    if (!fecha) return "-";
    const d = new Date(fecha);
    const nombres = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return `${nombres[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

const emptyForm = { EnEhitus: 0, CierreMes: 0, TraspasoMesEhitus: 0, ActualizarObras: 0 };

export default function ParametrosCierreMesPage() {
    const [form, setForm] = useState(emptyForm);
    const [mes, setMes] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        getPasosCierreHoras()
            .then((res) => {
                if (res.data) {
                    setMes(res.data.Mes ?? null);
                    setForm({
                        EnEhitus: res.data.EnEhitus ?? 0,
                        CierreMes: res.data.CierreMes ?? 0,
                        TraspasoMesEhitus: res.data.TraspasoMesEhitus ?? 0,
                        ActualizarObras: res.data.ActualizarObras ?? 0,
                    });
                }
            })
            .catch(() => setError("Error cargando parámetros"))
            .finally(() => setLoading(false));
    }, []);

    const handleToggle = (key) => {
        setForm((prev) => ({ ...prev, [key]: prev[key] ? 0 : 1 }));
    };

    const handleGuardar = async () => {
        setSaving(true);
        setSuccess(false);
        setError("");
        try {
            const mesAEnviar = mes || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`;
            await savePasosCierreHoras({ ...form, Mes: mesAEnviar });
            setMes(mesAEnviar);
            setSuccess(true);
        } catch {
            setError("Error guardando parámetros");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ maxWidth: 560, mx: "auto" }}>

            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                <Box sx={{
                    width: 36, height: 36, borderRadius: 2,
                    backgroundColor: "rgba(232,99,10,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <CalendarMonthIcon sx={{ color: "#E8630A", fontSize: 20 }} />
                </Box>
                <Typography variant="h6" fontWeight={700}>Parámetros cierre de mes</Typography>
            </Box>
            <Typography color="text.secondary" fontSize="0.85rem" mb={3} ml="52px">
                Configurá los pasos del proceso de cierre mensual. Cada opción indica si esa etapa fue ejecutada o está habilitada.
            </Typography>

            {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>Parámetros guardados correctamente</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

            <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>

                {/* Mes actual */}
                <Box sx={{ px: 3, py: 2, backgroundColor: "#fafafa", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography fontSize="0.85rem" color="text.secondary" fontWeight={500}>
                        Mes en proceso
                    </Typography>
                    <Typography fontWeight={700} fontSize="0.95rem" color="text.primary">
                        {formatMes(mes)}
                    </Typography>
                </Box>

                <Divider />

                {/* Pasos */}
                <Box sx={{ px: 3, pt: 2, pb: 0.5 }}>
                    <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.8, fontSize: "0.7rem" }}
                    >
                        Estados del cierre
                    </Typography>
                    <Divider sx={{ mt: 1 }} />

                    {pasos.map((paso, i) => (
                        <Box key={paso.key}>
                            <Box sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                py: 1.5,
                            }}>
                                <Box>
                                    <Typography fontWeight={500} fontSize="0.9rem">{paso.label}</Typography>
                                    <Typography fontSize="0.78rem" color="text.secondary">{paso.description}</Typography>
                                </Box>
                                <Switch
                                    checked={!!form[paso.key]}
                                    onChange={() => handleToggle(paso.key)}
                                    color="primary"
                                />
                            </Box>
                            {i < pasos.length - 1 && <Divider sx={{ borderStyle: "dashed" }} />}
                        </Box>
                    ))}
                </Box>

                {/* Footer */}
                <Box sx={{
                    px: 3, py: 2, mt: 1,
                    backgroundColor: "#fafafa",
                    borderTop: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    justifyContent: "flex-end",
                }}>
                    <Button
                        variant="contained"
                        onClick={handleGuardar}
                        disabled={saving}
                        sx={{ minWidth: 110 }}
                    >
                        {saving ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Guardar cambios"}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}
