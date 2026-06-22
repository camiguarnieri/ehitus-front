import { useEffect, useState } from "react";
import {
    Box, Typography, TextField, Button, CircularProgress, Alert, Paper
} from "@mui/material";
import { getParametroCargaHoraria, saveParametroCargaHoraria } from "../../api/apiCalls";

const dias = [
    { key: "lunes", label: "Lunes" },
    { key: "martes", label: "Martes" },
    { key: "miercoles", label: "Miércoles" },
    { key: "jueves", label: "Jueves" },
    { key: "viernes", label: "Viernes" },
    { key: "sabado", label: "Sábado" },
    { key: "domingo", label: "Domingo" },
];

const emptyForm = { lunes: "", martes: "", miercoles: "", jueves: "", viernes: "", sabado: "", domingo: "" };

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

    if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>;

    return (
        <Box>
            <Typography variant="h5" fontWeight={700} mb={3}>Parámetros carga horaria</Typography>
            <Typography color="text.secondary" fontSize="0.9rem" mb={3}>
                Definí cuántas horas corresponden a cada día de la semana. Las horas que superen este valor se consideran horas extra.
            </Typography>

            {success && <Alert severity="success" sx={{ mb: 2 }}>Parámetros guardados correctamente</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Paper variant="outlined" sx={{ borderRadius: 2, p: 3, maxWidth: 480 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {dias.map((dia) => (
                        <Box key={dia.key} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Typography sx={{ width: 100, fontWeight: 500 }}>{dia.label}</Typography>
                            <TextField
                                size="small"
                                type="number"
                                value={form[dia.key]}
                                onChange={(e) => setForm({ ...form, [dia.key]: e.target.value })}
                                slotProps={{ input: { inputProps: { min: 0, max: 24, step: 0.5 } } }}
                                sx={{ width: 120 }}
                                label="Horas"
                            />
                        </Box>
                    ))}
                </Box>

                <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                    <Button variant="contained" onClick={handleGuardar} disabled={saving}>
                        {saving ? <CircularProgress size={20} /> : "Guardar"}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}