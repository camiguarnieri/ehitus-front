import { useState, useMemo } from "react";
import {
    Box, Typography, TextField, Button, CircularProgress,
    Alert, useMediaQuery, useTheme, Chip, Tooltip
} from "@mui/material";
import GridOnIcon from "@mui/icons-material/GridOn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useNavigate } from "react-router-dom";
import { getControlCarga } from "../../api/apiCalls";

function getDatesInRange(fechaDesde, fechaHasta) {
    const dates = [];
    const current = new Date(fechaDesde + "T12:00:00");
    const end = new Date(fechaHasta + "T12:00:00");
    while (current <= end) {
        dates.push(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 1);
    }
    return dates;
}


const diasCortos = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function ControlCargaPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const navigate = useNavigate();

    const hoy = new Date().toISOString().split("T")[0];
    const primerDiaMes = hoy.substring(0, 7) + "-01";

    const [fechaDesde, setFechaDesde] = useState(primerDiaMes);
    const [fechaHasta, setFechaHasta] = useState(hoy);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [data, setData] = useState(null);

    const handleCargar = async () => {
        setLoading(true);
        setError("");
        setData(null);
        try {
            const res = await getControlCarga(fechaDesde, fechaHasta);
            setData(res.data);
        } catch {
            setError("Error cargando datos");
        } finally {
            setLoading(false);
        }
    };

    const fechas = useMemo(() =>
        data ? getDatesInRange(fechaDesde, fechaHasta) : []
        , [data, fechaDesde, fechaHasta]);

    // Mapa: { "codigo-fecha": { tieneHoras, esMia } }
    const mapaRegistros = useMemo(() => {
        if (!data) return {};
        const idUsuario = parseInt(localStorage.getItem("idUsuario"));
        const mapa = {};
        data.registros.forEach((r) => {
            mapa[`${r.Codigo}-${r.Fecha}`] = {
                tieneHoras: r.TotalHs > 0,
                esMia: r.IdUsuario === idUsuario,
                totalHs: r.TotalHs,
            };
        });
        return mapa;
    }, [data]);

    const nombreFuncionario = (f) =>
        `${f.Apellido1 || ''} ${f.Apellido2 || ''}`.trim() + ', ' + `${f.Nombre1 || ''}`.trim();

    const getSemanaDelMes = (numeroSemana) => {
        const hoyDate = new Date();
        const año = hoyDate.getFullYear();
        const mes = hoyDate.getMonth();
        const primerDia = new Date(año, mes, 1);
        const lunes = new Date(año, mes, 1 + (numeroSemana - 1) * 7);
        // Ajustar al lunes de esa semana
        const diffLunes = lunes.getDay() === 0 ? -6 : 1 - lunes.getDay();
        lunes.setDate(lunes.getDate() - diffLunes);
        // Si el lunes cae antes del mes, usar el primer día del mes
        const desde = lunes < primerDia ? primerDia : lunes;
        // El hasta es el domingo siguiente o el último día del mes
        const domingo = new Date(desde);
        domingo.setDate(domingo.getDate() + 6);
        const ultimoDia = new Date(año, mes + 1, 0);
        const hasta = domingo > ultimoDia ? ultimoDia : domingo;
        return {
            desde: desde.toISOString().split("T")[0],
            hasta: hasta.toISOString().split("T")[0],
        };
    };

    const aplicarPeriodo = (desde, hasta) => {
        setFechaDesde(desde);
        setFechaHasta(hasta);
        setData(null);
    };

    const hoyDate = new Date();
    const mesActual = `${hoyDate.getFullYear()}-${String(hoyDate.getMonth() + 1).padStart(2, "0")}`;
    const ultimoDiaMes = new Date(hoyDate.getFullYear(), hoyDate.getMonth() + 1, 0).getDate();

    const periodos = [
        {
            label: "Esta semana",
            onClick: () => {
                const lunes = new Date(hoyDate);
                const diff = lunes.getDay() === 0 ? -6 : 1 - lunes.getDay();
                lunes.setDate(lunes.getDate() + diff);
                const domingo = new Date(lunes);
                domingo.setDate(domingo.getDate() + 6);
                aplicarPeriodo(lunes.toISOString().split("T")[0], domingo.toISOString().split("T")[0]);
            }
        },
        {
            label: "Sem. pasada",
            onClick: () => {
                const lunes = new Date(hoyDate);
                const diff = lunes.getDay() === 0 ? -6 : 1 - lunes.getDay();
                lunes.setDate(lunes.getDate() + diff - 7);
                const domingo = new Date(lunes);
                domingo.setDate(domingo.getDate() + 6);
                aplicarPeriodo(lunes.toISOString().split("T")[0], domingo.toISOString().split("T")[0]);
            }
        },
        { label: "Sem. 1", onClick: () => { const s = getSemanaDelMes(1); aplicarPeriodo(s.desde, s.hasta); } },
        { label: "Sem. 2", onClick: () => { const s = getSemanaDelMes(2); aplicarPeriodo(s.desde, s.hasta); } },
        { label: "Sem. 3", onClick: () => { const s = getSemanaDelMes(3); aplicarPeriodo(s.desde, s.hasta); } },
        { label: "Sem. 4", onClick: () => { const s = getSemanaDelMes(4); aplicarPeriodo(s.desde, s.hasta); } },
        { label: "Este mes", onClick: () => aplicarPeriodo(`${mesActual}-01`, `${mesActual}-${ultimoDiaMes}`) },
    ];

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                <Box sx={{
                    width: 36, height: 36, borderRadius: 2,
                    backgroundColor: "rgba(232,99,10,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <GridOnIcon sx={{ color: "#E8630A", fontSize: 20 }} />
                </Box>
                <Typography variant="h6" fontWeight={700}>Control de carga</Typography>
            </Box>
            <Typography color="text.secondary" fontSize="0.85rem" sx={{ mb: 3, ml: "52px" }}>
                Verificá qué días tiene horas cargadas cada funcionario.
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                {periodos.map((p) => (
                    <Button
                        key={p.label}
                        size="small"
                        variant="outlined"
                        onClick={p.onClick}
                        sx={{
                            borderColor: "#E8630A",
                            color: "#E8630A",
                            fontSize: "0.78rem",
                            "&:hover": { backgroundColor: "rgba(232,99,10,0.06)", borderColor: "#E8630A" }
                        }}
                    >
                        {p.label}
                    </Button>
                ))}
            </Box>

            {/* Filtros */}
            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
                <TextField
                    label="Desde"
                    type="date"
                    size="small"
                    value={fechaDesde}
                    onChange={(e) => { setFechaDesde(e.target.value); setData(null); }}
                    sx={{ width: { xs: "100%", sm: 180 } }}
                    slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                    label="Hasta"
                    type="date"
                    size="small"
                    value={fechaHasta}
                    onChange={(e) => { setFechaHasta(e.target.value); setData(null); }}
                    sx={{ width: { xs: "100%", sm: 180 } }}
                    slotProps={{ inputLabel: { shrink: true } }}
                />
                <Button
                    variant="contained"
                    onClick={handleCargar}
                    disabled={!fechaDesde || !fechaHasta || loading}
                    sx={{ height: 40, minWidth: 100 }}
                >
                    {loading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Cargar"}
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {data && (
                <>
                    {/* Leyenda */}
                    <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <CheckCircleIcon sx={{ color: "success.main", fontSize: 18 }} />
                            <Typography fontSize="0.8rem" color="text.secondary">Con horas</Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <CancelIcon sx={{ color: "error.main", fontSize: 18 }} />
                            <Typography fontSize="0.8rem" color="text.secondary">Sin horas</Typography>
                        </Box>
                    </Box>

                    {isMobile ? (
                        /* ── Vista Mobile — cards por funcionario ── */
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                            {data.funcionarios.map((f) => {
                                const diasConHoras = fechas.filter(fecha => mapaRegistros[`${f.Codigo}-${fecha}`]?.tieneHoras).length;
                                const diasSinHoras = fechas.filter(fecha => !mapaRegistros[`${f.Codigo}-${fecha}`]).length;
                                const totalHs = fechas.reduce((acc, fecha) => {
                                    return acc + (mapaRegistros[`${f.Codigo}-${fecha}`]?.totalHs || 0);
                                }, 0);

                                return (
                                    <Box key={f.Codigo} sx={{
                                        backgroundColor: "#fff", borderRadius: 2,
                                        border: "1px solid", borderColor: "divider", p: 2,
                                    }}>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                                            <Box>
                                                <Typography fontWeight={600} fontSize="0.9rem">
                                                    {nombreFuncionario(f)}
                                                </Typography>
                                                <Typography fontSize="0.75rem" color="text.secondary">CI: {f.CI}</Typography>
                                            </Box>
                                            <Typography fontWeight={700} fontSize="0.9rem" color="#E8630A">
                                                {totalHs}hs
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: "flex", gap: 1 }}>
                                            <Chip
                                                size="small"
                                                icon={<CheckCircleIcon sx={{ fontSize: "14px !important" }} />}
                                                label={`${diasConHoras} días con horas`}
                                                color="success"
                                                variant="outlined"
                                                sx={{ fontSize: "0.75rem" }}
                                            />
                                            <Chip
                                                size="small"
                                                icon={<CancelIcon sx={{ fontSize: "14px !important" }} />}
                                                label={`${diasSinHoras} sin cargar`}
                                                color="error"
                                                variant="outlined"
                                                sx={{ fontSize: "0.75rem" }}
                                            />
                                        </Box>

                                        {/* Mini grilla de días — solo números */}
                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1.5 }}>
                                            {fechas.map((fecha) => {
                                                const reg = mapaRegistros[`${f.Codigo}-${fecha}`];
                                                const d = new Date(fecha + "T12:00:00");
                                                const esFinDeSemana = d.getDay() === 0 || d.getDay() === 6;
                                                return (
                                                    <Tooltip key={fecha} title={reg ? `${reg.totalHs}hs` : "Sin carga"}>
                                                        <Box sx={{
                                                            width: 28, height: 28,
                                                            borderRadius: 1,
                                                            display: "flex", alignItems: "center", justifyContent: "center",
                                                            backgroundColor: reg
                                                                ? "rgba(46,125,50,0.12)"
                                                                : esFinDeSemana
                                                                    ? "rgba(0,0,0,0.04)"
                                                                    : "rgba(211,47,47,0.08)",
                                                            border: "1px solid",
                                                            borderColor: reg
                                                                ? "rgba(46,125,50,0.3)"
                                                                : esFinDeSemana
                                                                    ? "rgba(0,0,0,0.08)"
                                                                    : "rgba(211,47,47,0.2)",
                                                        }}>
                                                            <Typography fontSize="0.65rem" fontWeight={600}
                                                                color={reg ? "success.dark" : esFinDeSemana ? "text.disabled" : "error.main"}>
                                                                {d.getDate()}
                                                            </Typography>
                                                        </Box>
                                                    </Tooltip>
                                                );
                                            })}
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    ) : (
                        /* ── Vista Desktop — grilla ── */
                        <Box sx={{ overflowX: "auto" }}>
                            <Box sx={{ minWidth: "max-content" }}>
                                <Box sx={{ display: "flex", mb: 0.5 }}>
                                    <Box sx={{ width: 180, flexShrink: 0 }} />
                                    {fechas.map((fecha) => {
                                        const d = new Date(fecha + "T12:00:00");
                                        const esFinDeSemana = d.getDay() === 0 || d.getDay() === 6;
                                        return (
                                            <Box key={fecha} sx={{
                                                width: 52, flexShrink: 0, textAlign: "center",
                                                backgroundColor: esFinDeSemana ? "rgba(0,0,0,0.04)" : "transparent",
                                                borderRadius: 1, py: 0.5,
                                            }}>
                                                <Typography fontSize="0.65rem" color="text.secondary" fontWeight={600}>
                                                    {diasCortos[d.getDay()]}
                                                </Typography>
                                                <Typography fontSize="0.75rem" fontWeight={700}>
                                                    {d.getDate()}
                                                </Typography>
                                            </Box>
                                        );
                                    })}
                                </Box>

                                {data.funcionarios.map((f) => (
                                    <Box key={f.Codigo} sx={{
                                        display: "flex", alignItems: "center", mb: 0.5,
                                        "&:hover": { backgroundColor: "rgba(232,99,10,0.04)" },
                                        borderRadius: 1,
                                    }}>
                                        <Box sx={{ width: 180, flexShrink: 0, pr: 1 }}>
                                            <Typography fontSize="0.8rem" fontWeight={600} noWrap>
                                                {nombreFuncionario(f)}
                                            </Typography>
                                            <Typography fontSize="0.7rem" color="text.secondary">
                                                CI: {f.CI}
                                            </Typography>
                                        </Box>

                                        {fechas.map((fecha) => {
                                            const key = `${f.Codigo}-${fecha}`;
                                            const reg = mapaRegistros[key];
                                            const d = new Date(fecha + "T12:00:00");
                                            const esFinDeSemana = d.getDay() === 0 || d.getDay() === 6;
                                            return (
                                                <Box key={fecha} sx={{
                                                    width: 52, flexShrink: 0,
                                                    display: "flex", justifyContent: "center", alignItems: "center",
                                                    height: 40,
                                                    backgroundColor: esFinDeSemana ? "rgba(0,0,0,0.04)" : "transparent",
                                                    borderRadius: 1,
                                                }}>
                                                    {reg ? (
                                                        <Tooltip title={`${reg.totalHs}hs`}>
                                                            <CheckCircleIcon sx={{ color: "success.main", fontSize: 20 }} />
                                                        </Tooltip>
                                                    ) : (
                                                        <Tooltip title="Ir a cargar">
                                                            <CancelIcon
                                                                sx={{ color: "error.light", fontSize: 20, cursor: "pointer", "&:hover": { color: "error.main" } }}
                                                                onClick={() => navigate(`/carga-horaria?fecha=${fecha}`)}
                                                            />
                                                        </Tooltip>
                                                    )}
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}

                    {/* Resumen */}
                    <Box sx={{ mt: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
                        <Chip label={`${data.funcionarios.length} funcionarios`} size="small" variant="outlined" />
                        <Chip label={`${fechas.length} días`} size="small" variant="outlined" />
                        <Chip label={`${data.registros.length} registros`} size="small" variant="outlined" color="primary" />
                    </Box>
                </>
            )}
        </Box>
    );
}