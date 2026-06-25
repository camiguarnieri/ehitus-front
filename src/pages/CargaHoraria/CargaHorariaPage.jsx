import { useEffect, useState } from "react";
import {
    Box, Typography, TextField, MenuItem, Button, CircularProgress,
    Alert, Card, CardContent, Divider, Chip, Checkbox, FormControlLabel,
    useMediaQuery, useTheme, Collapse, IconButton
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { getObras, getPlanillaHs, savePlanillaHs } from "../../api/apiCalls";

const diasSemana = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];

const tiposHs = [
    { key: "hsExtra", label: "Hs. extra" },
    { key: "hsExtraEsp", label: "Hs. extra esp." },
    { key: "hsNoc", label: "Hs. nocturnas" },
    { key: "hsExNoc", label: "Hs. extra noc." },
    { key: "hsExtNoctPerm", label: "Hs. extra noc. perm." },
    { key: "hsFeriados", label: "Hs. feriados" },
    { key: "hsLluvia", label: "Hs. lluvia" },
    { key: "hsViaje", label: "Hs. viaje" },
];

// donacion, paternidad, fallecimiento → checkbox; asamblea → input
const incidenciasCheck = [
    { key: "donacion", label: "Donación de sangre" },
    { key: "paternidad", label: "Paternidad" },
    { key: "fallecimiento", label: "Fallecimiento" },
];

const emptyRow = {
    hs: "", hsExtra: "", hsExtraEsp: "", hsNoc: "", hsExNoc: "",
    hsExtNoctPerm: "", hsFeriados: "", hsLluvia: "", hsViaje: "",
    altura: "", donacion: 0, asamblea: "", paternidad: 0, fallecimiento: 0,
};

const blockKeyDown = (e) => {
    if (e.key === "e" || e.key === "E" || e.key === "-") e.preventDefault();
};

function getHsNormales(parametro, fecha) {
    if (!parametro || !fecha) return "";
    const [year, month, day] = fecha.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    const dia = diasSemana[d.getDay()];
    const map = {
        lunes: parametro.Lunes, martes: parametro.Martes, miercoles: parametro.Miercoles,
        jueves: parametro.Jueves, viernes: parametro.Viernes, sabado: parametro.Sabado,
        domingo: parametro.Domingo,
    };
    return map[dia] ?? "";
}

function HsField({ value, onChange, fullWidth, sx }) {
    return (
        <TextField
            size="small"
            type="number"
            value={value}
            onChange={onChange}
            onKeyDown={blockKeyDown}
            fullWidth={fullWidth}
            sx={sx}
            slotProps={{ input: { inputProps: { min: 0, step: 0.5 } } }}
        />
    );
}

function FuncionarioCard({ func, data, onChange, parametro, fecha }) {
    const [expanded, setExpanded] = useState(false);
    const hsNormales = getHsNormales(parametro, fecha);
    const nombre = `${func.Apellido1} ${func.Apellido2} ${func.Nombre1} ${func.Nombre2}`.trim();

    const hsValue = parseFloat(data.hs);
    const showHsWarning = !isNaN(hsValue) && hsValue > 9;

    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 2, mb: 1.5,
                transition: "box-shadow 0.2s",
                "&:hover": { boxShadow: 3 },
                borderLeftWidth: 3,
                borderLeftColor: "#E8630A",
            }}
        >
            <CardContent sx={{ p: 2.5, pb: "20px !important" }}>
                {/* Header */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box>
                        <Typography fontWeight={600} fontSize="0.95rem" lineHeight={1.3}>
                            {nombre}
                        </Typography>
                        <Typography fontSize="0.78rem" color="text.secondary" mt={0.25}>
                            CI: {func.CI}
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => setExpanded(!expanded)} sx={{ ml: 1, mt: -0.5 }}>
                        {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                    </IconButton>
                </Box>

                {/* Horas normales + Altura */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 3, mt: 2, flexWrap: "wrap" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Typography fontSize="0.85rem" color="text.secondary" sx={{ minWidth: 110 }}>
                            Horas normales
                        </Typography>
                        <HsField
                            value={data.hs}
                            onChange={(e) => onChange("hs", e.target.value)}
                            sx={{ width: 88 }}
                        />
                        {hsNormales !== "" && (
                            <Chip
                                size="small"
                                label={`${hsNormales}hs`}
                                sx={{
                                    fontSize: "0.72rem", height: 22,
                                    backgroundColor: "rgba(232,99,10,0.08)",
                                    color: "#E8630A", fontWeight: 600,
                                }}
                            />
                        )}
                    </Box>

                    {/* Altura → ahora input numérico */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography fontSize="0.85rem" color="text.secondary">Altura</Typography>
                        <HsField
                            value={data.altura}
                            onChange={(e) => onChange("altura", e.target.value)}
                            sx={{ width: 88 }}
                        />
                    </Box>
                </Box>

                {/* Advertencia hs > 9 */}
                {showHsWarning && (
                    <Alert severity="warning" sx={{ mt: 1.5, py: 0.5, fontSize: "0.8rem" }}>
                        Se están cargando más de 9 horas normales para este funcionario.
                    </Alert>
                )}

                {/* Expandible */}
                <Collapse in={expanded}>
                    <Divider sx={{ mt: 2, mb: 2 }} />

                    <Typography sx={{
                        fontSize: "0.7rem", fontWeight: 700, color: "text.secondary",
                        textTransform: "uppercase", letterSpacing: 1, mb: 1.5,
                    }}>
                        Tipos de horas
                    </Typography>
                    <Box sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)", md: "repeat(4, 1fr)" },
                        gap: 1.5,
                    }}>
                        {tiposHs.map((tipo) => (
                            <Box key={tipo.key}>
                                <Typography fontSize="0.75rem" color="text.secondary" mb={0.5}>
                                    {tipo.label}
                                </Typography>
                                <HsField
                                    value={data[tipo.key]}
                                    onChange={(e) => onChange(tipo.key, e.target.value)}
                                    fullWidth
                                />
                            </Box>
                        ))}
                    </Box>

                    <Divider sx={{ mt: 2, mb: 2 }} />

                    <Typography sx={{
                        fontSize: "0.7rem", fontWeight: 700, color: "text.secondary",
                        textTransform: "uppercase", letterSpacing: 1, mb: 1.5,
                    }}>
                        Incidencias
                    </Typography>
                    <Box sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
                        gap: 1.5,
                        alignItems: "center",
                    }}>
                        {/* Checkboxes */}
                        {incidenciasCheck.map((inc) => (
                            <FormControlLabel
                                key={inc.key}
                                control={
                                    <Checkbox
                                        size="small"
                                        checked={!!data[inc.key]}
                                        onChange={(e) => onChange(inc.key, e.target.checked ? 1 : 0)}
                                        sx={{ color: "#E8630A", "&.Mui-checked": { color: "#E8630A" } }}
                                    />
                                }
                                label={<Typography fontSize="0.8rem" color="text.secondary">{inc.label}</Typography>}
                                sx={{ ml: 0 }}
                            />
                        ))}

                        {/* Asamblea → input numérico */}
                        <Box>
                            <Typography fontSize="0.75rem" color="text.secondary" mb={0.5}>
                                Asamblea
                            </Typography>
                            <HsField
                                value={data.asamblea}
                                onChange={(e) => onChange("asamblea", e.target.value)}
                                fullWidth
                            />
                        </Box>
                    </Box>
                </Collapse>
            </CardContent>
        </Card>
    );
}

export default function CargaHorariaPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const [fecha, setFecha] = useState(() => new Date().toISOString().split("T")[0]);
    const [obras, setObras] = useState([]);
    const [numObra, setNumObra] = useState("");
    const [funcionarios, setFuncionarios] = useState([]);
    const [planilla, setPlanilla] = useState({});
    const [parametro, setParametro] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingObras, setLoadingObras] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [cargado, setCargado] = useState(false);

    useEffect(() => {
        getObras()
            .then((res) => setObras(res.data.filter((o) => o.EstadoObra === 1)))
            .finally(() => setLoadingObras(false));
    }, []);

    const handleCargar = async () => {
        if (!fecha || !numObra) return;
        setLoading(true);
        setError("");
        setSuccess(false);
        try {
            const res = await getPlanillaHs(fecha, numObra);
            const { cargados, todos, parametro: param } = res.data;

            setParametro(param);
            setFuncionarios(todos);

            const planillaInicial = {};
            todos.forEach((f) => {
                const existing = cargados.find((c) => c.Codigo === f.Codigo);
                if (existing) {
                    planillaInicial[f.Codigo] = {
                        hs: existing.Hs ?? "",
                        hsExtra: existing.HsExtra ?? "",
                        hsExtraEsp: existing.HsExtraEsp ?? "",
                        hsNoc: existing.HsNoc ?? "",
                        hsExNoc: existing.HsExNoc ?? "",
                        hsExtNoctPerm: existing.HsExtNoctPerm ?? "",
                        hsFeriados: existing.HsFeriados ?? "",
                        hsLluvia: existing.HsLluvia ?? "",
                        hsViaje: existing.HsViaje ?? "",
                        altura: existing.Altura ?? "",
                        donacion: existing.Donacion ?? 0,
                        asamblea: existing.Asamblea ?? "",
                        paternidad: existing.Paternidad ?? 0,
                        fallecimiento: existing.Fallecimiento ?? 0,
                    };
                } else {
                    const hsNorm = getHsNormales(param, fecha);
                    planillaInicial[f.Codigo] = { ...emptyRow, hs: hsNorm !== "" ? hsNorm : "" };
                }
            });
            setPlanilla(planillaInicial);
            setCargado(true);
        } catch {
            setError("Error cargando datos");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (codigo, key, value) => {
        setPlanilla((prev) => {
            const updated = { ...prev[codigo], [key]: value };
            if (key === "hs") {
                const hsNorm = getHsNormales(parametro, fecha);
                if (hsNorm !== "" && value !== "") {
                    const diff = parseFloat(value) - parseFloat(hsNorm);
                    updated.hsExtra = diff > 0 ? diff : "";
                } else {
                    updated.hsExtra = "";
                }
            }
            return { ...prev, [codigo]: updated };
        });
    };

    const handleGuardar = async () => {
        setSaving(true);
        setSuccess(false);
        setError("");
        try {
            const registros = funcionarios
                .filter((f) => {
                    const d = planilla[f.Codigo];
                    return d && (d.hs !== "" && d.hs !== "0" && d.hs !== 0);
                })
                .map((f) => ({
                    codigo: f.Codigo,
                    fecha,
                    numObra,
                    ...planilla[f.Codigo],
                }));

            if (registros.length === 0) {
                setError("No hay horas cargadas para guardar");
                setSaving(false);
                return;
            }

            await savePlanillaHs(registros);
            setSuccess(true);
        } catch {
            setError("Error guardando");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                <Box sx={{
                    width: 36, height: 36, borderRadius: 2,
                    backgroundColor: "rgba(232,99,10,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <AccessTimeIcon sx={{ color: "#E8630A", fontSize: 20 }} />
                </Box>
                <Typography variant="h6" fontWeight={700}>Carga horaria</Typography>
            </Box>
            <Typography color="text.secondary" fontSize="0.85rem" sx={{ mb: 5, ml: "52px" }}>
                Seleccioná la fecha y la obra para cargar las horas del personal.
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
                <TextField
                    label="Fecha"
                    type="date"
                    size="small"
                    value={fecha}
                    onChange={(e) => { setFecha(e.target.value); setCargado(false); }}
                    sx={{ width: { xs: "100%", sm: 180 } }}
                    slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                    select
                    label="Obra"
                    size="small"
                    value={numObra}
                    onChange={(e) => { setNumObra(e.target.value); setCargado(false); }}
                    sx={{ width: { xs: "100%", sm: 260 } }}
                    disabled={loadingObras}
                >
                    {obras.map((o) => (
                        <MenuItem key={o.NumObra} value={o.NumObra}>
                            {o.Descripcion}
                        </MenuItem>
                    ))}
                </TextField>
                <Button
                    variant="contained"
                    onClick={handleCargar}
                    disabled={!fecha || !numObra || loading}
                    sx={{ height: 40, minWidth: 100 }}
                >
                    {loading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Cargar"}
                </Button>
            </Box>

            {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>Guardado correctamente</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

            {cargado && (
                <>
                    <Box sx={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        mb: 2, py: 1.25, px: 2,
                        backgroundColor: "rgba(232,99,10,0.05)",
                        borderRadius: 2, border: "1px solid rgba(232,99,10,0.15)",
                    }}>
                        <Typography fontSize="0.875rem" color="text.secondary">
                            <Box component="span" fontWeight={700} color="text.primary">
                                {funcionarios.length}
                            </Box>
                            {" funcionarios · "}
                            {new Date(fecha + "T12:00:00").toLocaleDateString("es-UY", {
                                weekday: "long", day: "numeric", month: "long",
                            })}
                        </Typography>
                        <Button variant="contained" onClick={handleGuardar} disabled={saving} size="small">
                            {saving ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Guardar todo"}
                        </Button>
                    </Box>

                    {funcionarios.map((f) => (
                        <FuncionarioCard
                            key={f.Codigo}
                            func={f}
                            data={planilla[f.Codigo] || emptyRow}
                            onChange={(key, value) => handleChange(f.Codigo, key, value)}
                            parametro={parametro}
                            fecha={fecha}
                        />
                    ))}

                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                        <Button variant="contained" onClick={handleGuardar} disabled={saving}>
                            {saving ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Guardar todo"}
                        </Button>
                    </Box>
                </>
            )}
        </Box>
    );
}