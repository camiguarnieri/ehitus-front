import { useEffect, useState } from "react";
import {
    Box, Typography, Button, CircularProgress, Alert, Paper,
    FormControlLabel, Switch, TextField, MenuItem
} from "@mui/material";
import { getPasosCierreHoras, savePasosCierreHoras } from "../../api/apiCalls";

const meses = [
    { value: 1, label: "Enero" }, { value: 2, label: "Febrero" },
    { value: 3, label: "Marzo" }, { value: 4, label: "Abril" },
    { value: 5, label: "Mayo" }, { value: 6, label: "Junio" },
    { value: 7, label: "Julio" }, { value: 8, label: "Agosto" },
    { value: 9, label: "Septiembre" }, { value: 10, label: "Octubre" },
    { value: 11, label: "Noviembre" }, { value: 12, label: "Diciembre" },
];

const emptyForm = {
    mes: new Date().getMonth() + 1,
    anio: new Date().getFullYear(),
    enEhitus: 0,
    cierreMes: 0,
    traspasoMesEhitus: 0,
    actualizarObras: 0,
};

export default function PasosCierreHorasPage() {
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        getPasosCierreHoras()
            .then((res) => {
                if (res.data) {
                    const fecha = new Date(res.data.Mes);
                    setForm({
                        mes: fecha.getUTCMonth() + 1,
                        anio: fecha.getUTCFullYear(),
                        enEhitus: res.data.EnEhitus || 0,
                        cierreMes: res.data.CierreMes || 0,
                        traspasoMesEhitus: res.data.TraspasoMesEhitus || 0,
                        actualizarObras: res.data.ActualizarObras || 0,
                    });
                }
            })
            .catch(() => setError("Error cargando datos"))
            .finally(() => setLoading(false));
    }, []);

    const mesLabel = meses.find((m) => m.value === form.mes)?.label || "";

    const handleGuardar = async () => {
        setSaving(true);
        setSuccess(false);
        setError("");
        try {
            const mesStr = `${form.anio}-${String(form.mes).padStart(2, "0")}-01`;
            console.log('mandando:', { ...form, mes: mesStr });
            await savePasosCierreHoras({ ...form, mes: mesStr });
            setSuccess(true);
        } catch {
            setError("Error guardando");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>;

    return (
        <Box>
            <Typography variant="h5" fontWeight={700} mb={1}>Parámetros cierre de mes</Typography>
            <Typography color="text.secondary" fontSize="0.9rem" mb={3}>
                Configurá el mes en proceso y los pasos completados.
            </Typography>

            {success && <Alert severity="success" sx={{ mb: 2 }}>Guardado correctamente</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Paper variant="outlined" sx={{ borderRadius: 2, p: 3, maxWidth: 480 }}>
                <Typography fontWeight={600} mb={2}>Mes en proceso</Typography>
                <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                    <TextField
                        select
                        label="Mes"
                        value={form.mes}
                        onChange={(e) => setForm({ ...form, mes: e.target.value })}
                        size="small"
                        sx={{ flex: 1 }}
                    >
                        {meses.map((m) => (
                            <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Año"
                        value={form.anio}
                        onChange={(e) => setForm({ ...form, anio: e.target.value })}
                        size="small"
                        type="number"
                        sx={{ width: 100 }}
                    />
                </Box>

                <Typography fontWeight={600} mb={1}>Pasos completados</Typography>
                <Typography color="text.secondary" fontSize="0.8rem" mb={2}>
                    Mes actual: {mesLabel} {form.anio}
                </Typography>

                {[
                    { key: "enEhitus", label: "En Ehitus" },
                    { key: "cierreMes", label: "Cierre de mes" },
                    { key: "traspasoMesEhitus", label: "Traspaso mes Ehitus" },
                    { key: "actualizarObras", label: "Actualizar obras" },
                ].map((item) => (
                    <FormControlLabel
                        key={item.key}
                        control={
                            <Switch
                                checked={form[item.key] === 1}
                                onChange={(e) => setForm({ ...form, [item.key]: e.target.checked ? 1 : 0 })}
                                color="primary"
                            />
                        }
                        label={item.label}
                        sx={{ display: "flex", mb: 1 }}
                    />
                ))}

                <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                    <Button variant="contained" onClick={handleGuardar} disabled={saving}>
                        {saving ? <CircularProgress size={20} /> : "Guardar"}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}