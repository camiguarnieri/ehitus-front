import { useEffect, useState } from "react";
import {
    Box, Typography, TextField, MenuItem, Button, CircularProgress,
    Alert, Card, CardContent, useMediaQuery, useTheme, Chip, Divider
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";
import DownloadIcon from "@mui/icons-material/Download";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { getObras, getFuncionarios, getReporte } from "../../api/apiCalls";

export default function ReportePage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const hoy = new Date();
    const primerDiaMes = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-01`;
    const hoyStr = hoy.toISOString().split("T")[0];

    const [mesDesde, setMesDesde] = useState(primerDiaMes);
    const [mesHasta, setMesHasta] = useState(hoyStr);
    const [numObra, setNumObra] = useState("");
    const [codigo, setCodigo] = useState("");
    const [obras, setObras] = useState([]);
    const [funcionarios, setFuncionarios] = useState([]);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingFiltros, setLoadingFiltros] = useState(true);
    const [error, setError] = useState("");
    const [buscado, setBuscado] = useState(false);

    useEffect(() => {
        Promise.all([getObras(), getFuncionarios()])
            .then(([obrasRes, funcRes]) => {
                setObras(obrasRes.data || []);
                setFuncionarios(funcRes.data || []);
            })
            .finally(() => setLoadingFiltros(false));
    }, []);

    const handleBuscar = async () => {
        setLoading(true);
        setError("");
        try {
            const params = { mesDesde, mesHasta };
            if (numObra) params.numObra = numObra;
            if (codigo) params.codigo = codigo;
            const res = await getReporte(params);
            setRows(res.data || []);
            setBuscado(true);
        } catch {
            setError("Error obteniendo reporte");
        } finally {
            setLoading(false);
        }
    };

    // Totales
    const totales = rows.reduce((acc, r) => ({
        Hs: acc.Hs + (r.Hs || 0),
        HsExtra: acc.HsExtra + (r.HsExtra || 0),
        HsNoc: acc.HsNoc + (r.HsNoc || 0),
        HsLluvia: acc.HsLluvia + (r.HsLluvia || 0),
        HsViaje: acc.HsViaje + (r.HsViaje || 0),
    }), { Hs: 0, HsExtra: 0, HsNoc: 0, HsLluvia: 0, HsViaje: 0 });

    const columns = [
        { field: "Fecha", headerName: "Fecha", width: 110 },
        { field: "NombreCompleto", headerName: "Funcionario", flex: 1, minWidth: 160 },
        {
            field: "Obra", headerName: "Obra", flex: 1, minWidth: 140,
            valueGetter: (value) => value?.trim()
        },
        { field: "Hs", headerName: "Hs", width: 70 },
        { field: "HsExtra", headerName: "Extra", width: 70 },
        { field: "HsNoc", headerName: "Noc.", width: 70 },
        { field: "HsLluvia", headerName: "Lluvia", width: 70 },
        { field: "HsViaje", headerName: "Viaje", width: 70 },
        {
            field: "Altura", headerName: "Altura", width: 70,
            renderCell: ({ value }) => value ? <Chip label="Sí" size="small" color="warning" /> : ""
        },
    ];

    const handleExportarExcel = () => {
        if (rows.length === 0) return;

        const headers = ["Fecha", "Funcionario", "Obra", "Hs Normales", "Hs Extra", "Hs Nocturnas", "Hs Lluvia", "Hs Viaje", "Altura", "Donación", "Asamblea", "Paternidad", "Fallecimiento"];

        const data = rows.map(r => [
            r.Fecha,
            r.NombreCompleto,
            r.Obra?.trim(),
            r.Hs,
            r.HsExtra,
            r.HsNoc,
            r.HsLluvia,
            r.HsViaje,
            r.Altura,
            r.Donacion,
            r.Asamblea,
            r.Paternidad,
            r.Fallecimiento,
        ]);

        const csvContent = [headers, ...data]
            .map(row => row.map(cell => `"${cell ?? 0}"`).join(","))
            .join("\n");

        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `reporte_ehitus_${mesDesde}_${mesHasta}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                <Box sx={{
                    width: 36, height: 36, borderRadius: 2,
                    backgroundColor: "rgba(232,99,10,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                    <AssessmentIcon sx={{ color: "#E8630A", fontSize: 20 }} />
                </Box>
                <Typography variant="h6" fontWeight={700}>Reporte de planilla</Typography>
            </Box>
            <Typography color="text.secondary" fontSize="0.85rem" mb={3} ml="52px">
                Consultá las horas cargadas por período, obra y funcionario.
            </Typography>

            {/* Filtros */}
            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
                <TextField
                    label="Desde"
                    type="date"
                    size="small"
                    value={mesDesde}
                    onChange={(e) => setMesDesde(e.target.value)}
                    sx={{ width: { xs: "100%", sm: 160 } }}
                    slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                    label="Hasta"
                    type="date"
                    size="small"
                    value={mesHasta}
                    onChange={(e) => setMesHasta(e.target.value)}
                    sx={{ width: { xs: "100%", sm: 160 } }}
                    slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                    select
                    label="Obra"
                    size="small"
                    value={numObra}
                    onChange={(e) => setNumObra(e.target.value)}
                    sx={{ width: { xs: "100%", sm: 200 } }}
                    disabled={loadingFiltros}
                >
                    <MenuItem value="">Todas</MenuItem>
                    {obras.map((o) => (
                        <MenuItem key={o.NumObra} value={o.NumObra}>{o.Descripcion.trim()}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    select
                    label="Funcionario"
                    size="small"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    sx={{ width: { xs: "100%", sm: 200 } }}
                    disabled={loadingFiltros}
                >
                    <MenuItem value="">Todos</MenuItem>
                    {funcionarios.map((f) => (
                        <MenuItem key={f.Codigo} value={f.Codigo}>
                            {`${f.Apellido1} ${f.Nombre1}`.trim()}
                        </MenuItem>
                    ))}
                </TextField>
                <Button
                    variant="contained"
                    onClick={handleBuscar}
                    disabled={loading || !mesDesde || !mesHasta}
                    sx={{ height: 40 }}
                >
                    {loading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Buscar"}
                </Button>
                {buscado && rows.length > 0 && (
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={handleExportarExcel}
                        sx={{ height: 40 }}
                    >
                        Exportar
                    </Button>
                )}
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

            {buscado && (
                <>
                    {/* Totales */}
                    <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
                        {[
                            { label: "Hs. normales", value: totales.Hs },
                            { label: "Hs. extra", value: totales.HsExtra },
                            { label: "Hs. nocturnas", value: totales.HsNoc },
                            { label: "Hs. lluvia", value: totales.HsLluvia },
                            { label: "Hs. viaje", value: totales.HsViaje },
                        ].map((t) => (
                            <Card key={t.label} variant="outlined" sx={{ borderRadius: 2, minWidth: 120 }}>
                                <CardContent sx={{ py: "12px !important", px: 2 }}>
                                    <Typography fontSize="0.75rem" color="text.secondary">{t.label}</Typography>
                                    <Typography fontWeight={700} fontSize="1.2rem">{t.value}</Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>

                    <Typography fontSize="0.85rem" color="text.secondary" mb={1}>
                        {rows.length} registros encontrados
                    </Typography>

                    {isMobile ? (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                            {rows.length === 0 ? (
                                <Typography color="text.secondary" textAlign="center" py={4}>Sin resultados</Typography>
                            ) : rows.map((r) => (
                                <Card key={r.ID_} variant="outlined" sx={{ borderRadius: 2 }}>
                                    <CardContent sx={{ pb: "12px !important" }}>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                                            <Typography fontWeight={600} fontSize="0.9rem">{r.NombreCompleto}</Typography>
                                            <Typography fontSize="0.85rem" color="text.secondary">{r.Fecha}</Typography>
                                        </Box>
                                        <Typography fontSize="0.82rem" color="text.secondary" mb={1}>{r.Obra?.trim()}</Typography>
                                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                            <Chip label={`${r.Hs}hs`} size="small" />
                                            {r.HsExtra > 0 && <Chip label={`Extra: ${r.HsExtra}`} size="small" color="warning" />}
                                            {r.HsNoc > 0 && <Chip label={`Noc: ${r.HsNoc}`} size="small" />}
                                            {r.HsLluvia > 0 && <Chip label={`Lluvia: ${r.HsLluvia}`} size="small" />}
                                            {r.HsViaje > 0 && <Chip label={`Viaje: ${r.HsViaje}`} size="small" />}
                                            {r.Altura > 0 && <Chip label="Altura" size="small" color="warning" />}
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    ) : (
                        <Box sx={{ backgroundColor: "#fff", borderRadius: 2, overflow: "hidden" }}>
                            <DataGrid
                                rows={rows}
                                columns={columns}
                                getRowId={(row) => row.ID_}
                                autoHeight
                                pageSizeOptions={[10, 25, 50]}
                                initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
                                disableRowSelectionOnClick
                                localeText={esES.components.MuiDataGrid.defaultProps.localeText}
                                sx={{
                                    border: "none",
                                    "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f5f5f5", fontWeight: 600 },
                                    "& .MuiDataGrid-row:hover": { backgroundColor: "#fff8f4" },
                                }}
                            />
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
}