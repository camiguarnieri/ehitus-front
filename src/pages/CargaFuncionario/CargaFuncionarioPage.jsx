import { useEffect, useState, useMemo } from "react";
import {
    Box, Typography, TextField, MenuItem, Button, CircularProgress,
    Alert, Card, CardContent, Divider, Chip, Collapse, IconButton,
    useMediaQuery, useTheme
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { getFuncionarios, getObras, getCargaFuncionario, savePlanillaHs } from "../../api/apiCalls";

const diasSemana = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
const diasCortos = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const tiposHs = [
    { key: "hsNoc", label: "Hs. nocturna esporádica (30%)" },
    { key: "hsExtNoctPerm", label: "Hs. nocturna permanente (50%)" },
    { key: "hsExtra", label: "Hs. extra" },
    { key: "hsExNoc", label: "Hs. extra nocturna" },
    { key: "hsExtraEsp", label: "Hs. extra especial" },
    { key: "altura", label: "Comp. altura" },
];

const tiposHsAdmin = [
    { key: "hsFeriados", label: "Hs. feriados" },
    { key: "hsViaje", label: "Hs. viaje" },
];

const incidenciasCheck = [
    { key: "donacion", label: "Donación de sangre" },
    { key: "paternidad", label: "Paternidad" },
    { key: "fallecimiento", label: "Fallecimiento" },
];

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

const blockKeyDown = (e) => {
    if (e.key === "e" || e.key === "E" || e.key === "-") e.preventDefault();
};

function HsField({ value, onChange, sx }) {
    return (
        <TextField
            size="small" type="number" value={value} onChange={onChange}
            onKeyDown={blockKeyDown} sx={sx}
            slotProps={{ input: { inputProps: { min: 0, step: 0.5 } } }}
        />
    );
}

function DiaCard({ fecha, numObra, data, onChange, parametro }) {
    const [expanded, setExpanded] = useState(false);
    const d = new Date(fecha + "T12:00:00");
    const esFinDeSemana = d.getDay() === 0 || d.getDay() === 6;
    const hsNormales = getHsNormales(parametro, fecha);
    const hsValue = parseFloat(data.hs);
    const showWarning = !isNaN(hsValue) && hsValue !== "" && hsNormales !== "" && hsValue < parseFloat(hsNormales);
    const diaNombre = diasCortos[d.getDay()];
    const diaNum = d.getDate();
    const rol = localStorage.getItem("rol");
    const tiposMostrar = rol === "admin" ? [...tiposHs, ...tiposHsAdmin] : tiposHs;

    return (
        <Card variant="outlined" sx={{
            borderRadius: 2, mb: 1,
            borderLeftWidth: 3,
            borderLeftColor: data.hs && data.hs !== "" && data.hs !== 0
                ? "#E8630A"
                : esFinDeSemana ? "#ccc" : "divider",
            opacity: esFinDeSemana && !data.hs ? 0.6 : 1,
        }}>
            <CardContent sx={{ p: 2, pb: "12px !important" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                    {/* Día */}
                    <Box sx={{ minWidth: 48, textAlign: "center" }}>
                        <Typography fontSize="0.7rem" color="text.secondary" fontWeight={600} textTransform="uppercase">
                            {diaNombre}
                        </Typography>
                        <Typography fontWeight={800} fontSize="1.1rem">{diaNum}</Typography>
                    </Box>

                    <Divider orientation="vertical" flexItem />

                    {/* Horas trabajadas */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography fontSize="0.82rem" color="text.secondary" sx={{ minWidth: 90 }}>
                            Horas trabajadas
                        </Typography>
                        <HsField
                            value={data.hs}
                            onChange={(e) => onChange("hs", e.target.value)}
                            sx={{ width: 80 }}
                        />
                        {hsNormales !== "" && (
                            <Chip size="small" label={`${hsNormales}hs`} sx={{
                                fontSize: "0.7rem", height: 20,
                                backgroundColor: "rgba(232,99,10,0.08)",
                                color: "#E8630A", fontWeight: 600,
                            }} />
                        )}
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography fontSize="0.82rem" color="text.secondary">Hs. lluvia</Typography>
                        <HsField value={data.hsLluvia} onChange={(e) => onChange("hsLluvia", e.target.value)} sx={{ width: 72 }} />
                    </Box>

                    <Box sx={{ flexGrow: 1 }} />

                    <IconButton size="small" onClick={() => setExpanded(!expanded)}>
                        {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                    </IconButton>
                </Box>

                {showWarning && (
                    <Alert severity="warning" sx={{ mt: 1, py: 0.25, fontSize: "0.78rem" }}>
                        {`Este funcionario tiene ${hsNormales}hs asignadas para este día. Seleccioná una incidencia.`}
                    </Alert>
                )}

                <Collapse in={expanded}>
                    <Divider sx={{ mt: 1.5, mb: 1.5 }} />
                    <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: 1, mb: 1 }}>
                        Tipos de horas
                    </Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 1.5 }}>
                        {tiposaMostrar.map((tipo) => (
                            <Box key={tipo.key}>
                                <Typography fontSize="0.72rem" color="text.secondary" mb={0.5}>{tipo.label}</Typography>
                                <HsField value={data[tipo.key]} onChange={(e) => onChange(tipo.key, e.target.value)} sx={{ width: "100%" }} />
                            </Box>
                        ))}
                    </Box>

                    <Divider sx={{ mt: 1.5, mb: 1.5 }} />
                    <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: 1, mb: 1 }}>
                        Incidencias
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
                        {incidenciasCheck.map((inc) => (
                            <Box key={inc.key} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <input
                                    type="checkbox"
                                    checked={!!data[inc.key]}
                                    onChange={(e) => onChange(inc.key, e.target.checked ? 1 : 0)}
                                    style={{ accentColor: "#E8630A", width: 16, height: 16 }}
                                />
                                <Typography fontSize="0.8rem" color="text.secondary">{inc.label}</Typography>
                            </Box>
                        ))}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography fontSize="0.8rem" color="text.secondary">Asamblea</Typography>
                            <HsField value={data.asamblea} onChange={(e) => onChange("asamblea", e.target.value)} sx={{ width: 72 }} />
                        </Box>
                    </Box>
                </Collapse>
            </CardContent>
        </Card>
    );
}

const emptyDia = {
    hs: "", hsExtra: "", hsExtraEsp: "", hsNoc: "", hsExNoc: "",
    hsExtNoctPerm: "", hsFeriados: "", hsLluvia: "", hsViaje: "",
    altura: "", donacion: 0, asamblea: "", paternidad: 0, fallecimiento: 0,
};

function getDiasEnPeriodo(fechaDesde, fechaHasta) {
    const dias = [];
    const current = new Date(fechaDesde + "T12:00:00");
    const end = new Date(fechaHasta + "T12:00:00");
    while (current <= end) {
        dias.push(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 1);
    }
    return dias;
}

export default function CargaFuncionarioPage() {
    const theme = useTheme();
    const hoyDate = new Date();
    const mesActual = hoyDate.toISOString().substring(0, 7);
    const quincenaActual = hoyDate.getDate() <= 15 ? "1" : "2";

    const [funcionarios, setFuncionarios] = useState([]);
    const [obras, setObras] = useState([]);
    const [loadingInit, setLoadingInit] = useState(true);

    const [codigo, setCodigo] = useState("");
    const [mes, setMes] = useState(mesActual);
    const [quincena, setQuincena] = useState(quincenaActual);
    const [numObra, setNumObra] = useState("");

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [data, setData] = useState(null);
    const [planilla, setPlanilla] = useState({});

    useEffect(() => {
        Promise.all([getFuncionarios(), getObras()])
            .then(([fRes, oRes]) => {
                setFuncionarios(fRes.data || []);
                setObras((oRes.data || []).filter(o => o.EstadoObra === 1));
            })
            .finally(() => setLoadingInit(false));
    }, []);

    const handleCargar = async () => {
        if (!codigo || !mes || !quincena || !numObra) return;
        setLoading(true);
        setError("");
        setSuccess(false);
        setData(null);
        try {
            const res = await getCargaFuncionario(codigo, mes, quincena);
            const { funcionario, parametro, fechaDesde, fechaHasta, registros } = res.data;
            setData(res.data);

            const dias = getDiasEnPeriodo(fechaDesde, fechaHasta);
            const planillaInicial = {};
            dias.forEach((fecha) => {
                const existing = registros.find(r => r.Fecha === fecha);
                if (existing) {
                    planillaInicial[fecha] = {
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
                    const hsNorm = getHsNormales(parametro, fecha);
                    planillaInicial[fecha] = { ...emptyDia, hs: hsNorm !== "" ? hsNorm : "" };
                }
            });
            setPlanilla(planillaInicial);
        } catch {
            setError("Error cargando datos");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (fecha, key, value) => {
        setPlanilla(prev => {
            const updated = { ...prev[fecha], [key]: value };
            if (key === "hs" && data?.parametro) {
                const hsNorm = getHsNormales(data.parametro, fecha);
                if (hsNorm !== "" && value !== "") {
                    const diff = parseFloat(value) - parseFloat(hsNorm);
                    updated.hsExtra = diff > 0 ? diff : "";
                } else {
                    updated.hsExtra = "";
                }
            }
            return { ...prev, [fecha]: updated };
        });
    };

    const handleGuardar = async () => {
        setSaving(true);
        setSuccess(false);
        setError("");
        try {
            const dias = getDiasEnPeriodo(data.fechaDesde, data.fechaHasta);
            const registros = dias
                .filter(fecha => {
                    const d = planilla[fecha];
                    return d && d.hs !== "" && d.hs !== "0" && d.hs !== 0;
                })
                .map(fecha => ({
                    codigo: Number(codigo),
                    fecha,
                    numObra,
                    ...planilla[fecha],
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

    const dias = useMemo(() =>
        data ? getDiasEnPeriodo(data.fechaDesde, data.fechaHasta) : []
        , [data]);

    const nombreFuncionario = (f) =>
        `${f.Apellido1 || ''} ${f.Apellido2 || ''}`.trim() + ', ' + `${f.Nombre1 || ''}`.trim();

    if (loadingInit) return <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>;

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                <Box sx={{
                    width: 36, height: 36, borderRadius: 2,
                    backgroundColor: "rgba(232,99,10,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <PersonIcon sx={{ color: "#E8630A", fontSize: 20 }} />
                </Box>
                <Typography variant="h6" fontWeight={700}>Carga por funcionario</Typography>
            </Box>
            <Typography color="text.secondary" fontSize="0.85rem" sx={{ mb: 3, ml: "52px" }}>
                Cargá las horas de un funcionario para una quincena completa.
            </Typography>

            {/* Filtros */}
            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
                <TextField
                    select label="Funcionario" size="small"
                    value={codigo} onChange={(e) => { setCodigo(e.target.value); setData(null); }}
                    sx={{ width: { xs: "100%", sm: 220 } }}
                >
                    {funcionarios.map((f) => (
                        <MenuItem key={f.Codigo} value={f.Codigo}>
                            {nombreFuncionario(f)}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    select label="Obra" size="small"
                    value={numObra} onChange={(e) => { setNumObra(e.target.value); setData(null); }}
                    sx={{ width: { xs: "100%", sm: 200 } }}
                >
                    {obras.map((o) => (
                        <MenuItem key={o.NumObra} value={o.NumObra}>{o.Descripcion}</MenuItem>
                    ))}
                </TextField>

                <TextField
                    label="Mes" type="month" size="small"
                    value={mes} onChange={(e) => { setMes(e.target.value); setData(null); }}
                    sx={{ width: { xs: "100%", sm: 160 } }}
                    slotProps={{ inputLabel: { shrink: true } }}
                />

                <TextField
                    select label="Quincena" size="small"
                    value={quincena} onChange={(e) => { setQuincena(e.target.value); setData(null); }}
                    sx={{ width: { xs: "100%", sm: 140 } }}
                >
                    <MenuItem value="1">1ra (1-15)</MenuItem>
                    <MenuItem value="2">2da (16-fin)</MenuItem>
                </TextField>

                <Button
                    variant="contained"
                    onClick={handleCargar}
                    disabled={!codigo || !mes || !quincena || !numObra || loading}
                    sx={{ height: 40, minWidth: 100 }}
                >
                    {loading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Cargar"}
                </Button>
            </Box>

            {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>Guardado correctamente</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

            {data && (
                <>
                    {/* Info bar */}
                    <Box sx={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        mb: 2, py: 1.25, px: 2,
                        backgroundColor: "rgba(232,99,10,0.05)",
                        borderRadius: 2, border: "1px solid rgba(232,99,10,0.15)",
                    }}>
                        <Typography fontSize="0.875rem" color="text.secondary">
                            <Box component="span" fontWeight={700} color="text.primary">
                                {nombreFuncionario(data.funcionario)}
                            </Box>
                            {" · "}{data.fechaDesde} al {data.fechaHasta}
                        </Typography>
                        <Button variant="contained" onClick={handleGuardar} disabled={saving} size="small">
                            {saving ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Guardar todo"}
                        </Button>
                    </Box>

                    {dias.map((fecha) => (
                        <DiaCard
                            key={fecha}
                            fecha={fecha}
                            numObra={numObra}
                            data={planilla[fecha] || emptyDia}
                            onChange={(key, value) => handleChange(fecha, key, value)}
                            parametro={data.parametro}
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