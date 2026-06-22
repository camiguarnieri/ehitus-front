import { useEffect, useState } from "react";
import {
    Box, Typography, Button, Chip, TextField, InputAdornment,
    Dialog, DialogTitle, DialogContent, DialogActions,
    FormControl, InputLabel, Select, MenuItem, CircularProgress,
    Card, CardContent, useMediaQuery, useTheme
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";
import AddIcon from "@mui/icons-material/Add";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import SearchIcon from "@mui/icons-material/Search";
import { getFuncionarios, createFuncionario } from "../../api/apiCalls";

const estadoLabel = { A: "Activo", E: "Egresado", I: "Inactivo" };
const estadoColor = { A: "success", E: "warning", I: "error" };
const jormenLabel = { J: "Jornalero", M: "Mensual" };

const emptyForm = { apellido1: "", apellido2: "", nombre1: "", nombre2: "", ci: "", jorMen: "J" };

export default function FuncionariosPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const cargar = async () => {
        setLoading(true);
        try {
            const res = await getFuncionarios();
            setRows(res.data);
        } catch {
            setError("Error cargando funcionarios");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargar(); }, []);

    const filtered = rows.filter((r) => {
        const texto = `${r.Apellido1} ${r.Apellido2} ${r.Nombre1} ${r.Nombre2} ${r.CI}`.toLowerCase();
        return texto.includes(search.toLowerCase());
    });

    const handleGuardar = async () => {
        if (!form.apellido1 || !form.nombre1 || !form.ci) {
            setError("Apellido, nombre y CI son obligatorios");
            return;
        }
        setSaving(true);
        setError("");
        try {
            await createFuncionario(form);
            setDialogOpen(false);
            setForm(emptyForm);
            cargar();
        } catch (err) {
            setError(err?.response?.data?.message || "Error guardando funcionario");
        } finally {
            setSaving(false);
        }
    };

    const columns = [
        { field: "Codigo", headerName: "Código", width: 80 },
        { field: "CI", headerName: "CI", width: 120 },
        {
            field: "nombre_completo",
            headerName: "Nombre completo",
            flex: 1,
            valueGetter: (value, row) => `${row.Apellido1} ${row.Apellido2} ${row.Nombre1} ${row.Nombre2}`.trim(),
        },
        {
            field: "JorMen",
            headerName: "Tipo",
            width: 110,
            renderCell: ({ value }) => (
                <Chip label={jormenLabel[value] || value} size="small" variant="outlined" />
            ),
        },
        {
            field: "Estado",
            headerName: "Estado",
            width: 100,
            renderCell: ({ value }) => (
                <Chip label={estadoLabel[value] || value} size="small" color={estadoColor[value] || "default"} />
            ),
        },
    ];

    return (
        <Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 2 }}>
                <Typography variant="h5" fontWeight={700}>Funcionarios</Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Button variant="outlined" startIcon={<FileUploadIcon />}>Importar</Button>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm(emptyForm); setError(""); setDialogOpen(true); }}>
                        Agregar
                    </Button>
                </Box>
            </Box>

            <TextField
                placeholder="Buscar por nombre, apellido o CI..."
                size="small"
                fullWidth
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ mb: 2 }}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
            />

            {/* MOBILE: cards */}
            {isMobile ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {loading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : filtered.length === 0 ? (
                        <Typography color="text.secondary" textAlign="center" py={4}>Sin resultados</Typography>
                    ) : filtered.map((r) => (
                        <Card key={r.Codigo} variant="outlined" sx={{ borderRadius: 2 }}>
                            <CardContent sx={{ pb: "12px !important" }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
                                    <Typography fontWeight={600} fontSize="0.95rem">
                                        {`${r.Apellido1} ${r.Apellido2} ${r.Nombre1} ${r.Nombre2}`.trim()}
                                    </Typography>
                                    <Chip label={estadoLabel[r.Estado] || r.Estado} size="small" color={estadoColor[r.Estado] || "default"} />
                                </Box>
                                <Typography color="text.secondary" fontSize="0.85rem">CI: {r.CI}</Typography>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                                    <Typography color="text.secondary" fontSize="0.8rem">Código: {r.Codigo}</Typography>
                                    <Chip label={jormenLabel[r.JorMen] || r.JorMen} size="small" variant="outlined" />
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            ) : (
                /* DESKTOP: tabla */
                <Box sx={{ backgroundColor: "#fff", borderRadius: 2, overflow: "hidden" }}>
                    <DataGrid
                        rows={filtered}
                        columns={columns}
                        getRowId={(row) => row.Codigo}
                        loading={loading}
                        autoHeight
                        pageSizeOptions={[10, 25, 50]}
                        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
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

            {/* Dialog agregar */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Agregar funcionario</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                        {error && <Typography color="error" fontSize="0.85rem">{error}</Typography>}
                        <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                            <TextField label="Apellido *" fullWidth value={form.apellido1} onChange={(e) => setForm({ ...form, apellido1: e.target.value })} />
                            <TextField label="Segundo apellido" fullWidth value={form.apellido2} onChange={(e) => setForm({ ...form, apellido2: e.target.value })} />
                        </Box>
                        <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                            <TextField label="Nombre *" fullWidth value={form.nombre1} onChange={(e) => setForm({ ...form, nombre1: e.target.value })} />
                            <TextField label="Segundo nombre" fullWidth value={form.nombre2} onChange={(e) => setForm({ ...form, nombre2: e.target.value })} />
                        </Box>
                        <TextField label="CI *" value={form.ci} onChange={(e) => setForm({ ...form, ci: e.target.value })} />
                        <FormControl fullWidth>
                            <InputLabel>Tipo</InputLabel>
                            <Select value={form.jorMen} label="Tipo" onChange={(e) => setForm({ ...form, jorMen: e.target.value })}>
                                <MenuItem value="J">Jornalero</MenuItem>
                                <MenuItem value="M">Mensual</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={handleGuardar} disabled={saving}>
                        {saving ? <CircularProgress size={20} /> : "Guardar"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}