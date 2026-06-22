import { useEffect, useState } from "react";
import {
    Box, Typography, TextField, Button, CircularProgress, Alert, Paper, Divider
} from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import { getParametroCargaHoraria, saveParametroCargaHoraria } from "../../api/apiCalls";

const diasHabiles = [
    { key: "lunes", label: "Lunes" },
    { key: "martes", label: "Martes" },
    { key: "miercoles", label: "Miércoles" },
    { key: "jueves", label: "Jueves" },
    { key: "viernes", label: "Viernes" },
];

const diasFinde = [
    { key: "sabado", label: "Sábado" },
    { key: "domingo", label: "Domingo" },
];

const emptyForm = { lunes: "", martes: "", miercoles: "", jueves: "", viernes: "", sabado: "", domingo: "" };

function DiaRow({ dia, value, onChange }) {
    return (
        <Box sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            py: 1.25,
        }}>
            <Typography sx={{ fontWeight: 500, fontSize: "0.9rem", color: "text.primary" }}>
                {dia.label}
            </Typography>
            <TextField
                size="small"
                type="number"
                value={value}
                onChange={onChange}
                slotProps={{ input: { inputProps: { min: 0, max: 24, step: 0.5 } } }}
                sx={{ width: 110 }}
                label="Horas"
            />
        </Box>
    );
}

export default function ParametrosCargaHorariaPage() {
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        getParametroCargaHoraria()
            .then((res) => {
                if (res.data) {
                    setForm({
                        lunes: res.data.Lunes ?? "",
                        martes: res.data.Martes ?? "",
                        miercoles: res.data.Miercoles ?? "",
                        jueves: res.data.Jueves ?? "",
                        viernes: res.data.Viernes ?? "",
                        sabado: res.data.Sabado ?? "",
                        domingo: res.data.Domingo ?? "",
                    });
                }
            })
            .catch(() => setError("Error cargando parámetros"))
            .finally(() => setLoading(false));
    }, []);

    const handleGuardar = async () => {
        setSaving(true);
        setSuccess(false);
        setError("");
        try {
            await saveParametroCargaHoraria(form);
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
                    <TuneIcon sx={{ color: "#E8630A", fontSize: 20 }} />
                </Box>
                <Typography variant="h6" fontWeight={700}>Parámetros carga horaria</Typography>
            </Box>
            <Typography color="text.secondary" fontSize="0.85rem" mb={3} ml="52px">
                Definí cuántas horas corresponden a cada día de la semana. Las horas que superen este valor se consideran extras.
            </Typography>

            {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>Parámetros guardados correctamente</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

            <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>

                {/* Días hábiles */}
                <Box sx={{ px: 3, pt: 2.5, pb: 0.5 }}>
                    <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.8, fontSize: "0.7rem" }}
                    >
                        Días hábiles
                    </Typography>
                    <Divider sx={{ mt: 1, mb: 0.5 }} />
                    {diasHabiles.map((dia) => (
                        <DiaRow
                            key={dia.key}
                            dia={dia}
                            value={form[dia.key]}
                            onChange={(e) => setForm({ ...form, [dia.key]: e.target.value })}
                        />
                    ))}
                </Box>

                <Divider sx={{ borderStyle: "dashed", mx: 3 }} />

                {/* Fin de semana */}
                <Box sx={{ px: 3, pt: 2, pb: 0.5 }}>
                    <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.8, fontSize: "0.7rem" }}
                    >
                        Fin de semana
                    </Typography>
                    <Divider sx={{ mt: 1, mb: 0.5 }} />
                    {diasFinde.map((dia) => (
                        <DiaRow
                            key={dia.key}
                            dia={dia}
                            value={form[dia.key]}
                            onChange={(e) => setForm({ ...form, [dia.key]: e.target.value })}
                        />
                    ))}
                </Box>

                {/* Footer con botón */}
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
