import { useEffect, useState } from "react";
import {
    Box, Typography, Button, Chip, TextField, InputAdornment,
    Dialog, DialogTitle, DialogContent, DialogActions,
    FormControl, InputLabel, Select, MenuItem, CircularProgress,
    Card, CardContent, useMediaQuery, useTheme, IconButton, Tooltip,
    Alert
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";
import AddIcon from "@mui/icons-material/Add";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import { getFuncionarios, createFuncionario, updateFuncionario, getCategorias } from "../../api/apiCalls";

const estadoLabel = { A: "Activo", E: "Egresado", I: "Inactivo" };
const estadoColor = { A: "success", E: "warning", I: "error" };
const jormenLabel = { J: "Jornalero", M: "Mensual" };

const emptyForm = {
    apellido1: "", apellido2: "", nombre1: "", nombre2: "",
    ci: "", jorMen: "J", estado: "A", industria: false, ley14411Industria: false, codCat: ""
};

export default function FuncionariosPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [categorias, setCategorias] = useState([]);

    const cargar = async () => {
        setLoading(true);
        try {
            const [funcRes, catRes] = await Promise.all([getFuncionarios(), getCategorias()]);
            setRows(funcRes.data || []);
            setCategorias(catRes.data || []);
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

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setError("");
        setDialogOpen(true);
    };

    const openEdit = (row) => {
        setEditing(row);
        setForm({
            apellido1: row.Apellido1 || "",
            apellido2: row.Apellido2 || "",
            nombre1: row.Nombre1 || "",
            nombre2: row.Nombre2 || "",
            ci: row.CI || "",
            jorMen: row.JorMen || "J",
            estado: row.Estado || "A",
            industria: row.Industria === 1 || row.Industria === true,
            ley14411Industria: row.Ley14411Industria === 1 || row.Ley14411Industria === true,
            codCat: row.CodCat || "",
        });
        setError("");
        setDialogOpen(true);
    };

    const handleGuardar = async () => {
        if (!form.apellido1 || !form.nombre1 || !form.ci) {
            setError("Apellido, nombre y CI son obligatorios");
            return;
        }
        setSaving(true);
        setError("");
        try {
            if (editing) {
                await updateFuncionario(editing.Codigo, form);
            } else {
                await createFuncionario(form);
            }
            setDialogOpen(false);
            setForm(emptyForm);
            setEditing(null);
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
            field: "nombre_completo", headerName: "Nombre completo", flex: 1,
            valueGetter: (value, row) => `${row.Apellido1} ${row.Apellido2} ${row.Nombre1} ${row.Nombre2}`.trim(),
        },
        {
            field: "JorMen", headerName: "Tipo", width: 110,
            renderCell: ({ value }) => (
                <Chip label={jormenLabel[value] || value} size="small" variant="outlined" />
            ),
        },
        {
            field: "Industria", headerName: "Sector", width: 150,
            renderCell: ({ value }) => value
                ? <Chip label="Incluido Ley 14411" size="small" color="success" />
                : <Chip label="No incluido" size="small" variant="outlined" />
        },
        {
            field: "DescripcionCategoria", headerName: "Categoría", flex: 1, minWidth: 150,
            renderCell: ({ value }) => value
                ? <Typography fontSize="0.85rem">{value}</Typography>
                : <Typography fontSize="0.85rem" color="text.disabled">Sin categoría</Typography>
        },
        {
            field: "Estado", headerName: "Estado", width: 100,
            renderCell: ({ value }) => (
                <Chip label={estadoLabel[value] || value} size="small" color={estadoColor[value] || "default"} />
            ),
        },
        {
            field: "acciones", headerName: "", width: 80, sortable: false, filterable: false,
            renderCell: ({ row }) => (
                <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => openEdit(row)}>
                        <EditIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            ),
        },
    ];

    return (
        <Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 2 }}>
                <Typography variant="h5" fontWeight={700}>Funcionarios</Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Button variant="outlined" startIcon={<FileUploadIcon />}>Importar</Button>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Agregar</Button>
                </Box>
            </Box>

            <TextField
                placeholder="Buscar por nombre, apellido o CI..."
                size="small" fullWidth value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ mb: 2 }}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
            />

            {isMobile ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {loading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>
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
                                {r.DescripcionCategoria && (
                                    <Typography color="text.secondary" fontSize="0.82rem">
                                        {r.DescripcionCategoria}
                                    </Typography>
                                )}
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                                        <Chip label={jormenLabel[r.JorMen] || r.JorMen} size="small" variant="outlined" />
                                        {r.Industria
                                            ? <Chip label="Incluido Ley 14411" size="small" color="success" />
                                            : <Chip label="No incluido" size="small" variant="outlined" />}
                                    </Box>
                                    <IconButton size="small" onClick={() => openEdit(r)}><EditIcon fontSize="small" /></IconButton>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            ) : (
                <Box sx={{ backgroundColor: "#fff", borderRadius: 2, overflow: "hidden" }}>
                    <DataGrid
                        rows={filtered} columns={columns} getRowId={(row) => row.Codigo}
                        loading={loading} autoHeight pageSizeOptions={[10, 25, 50]}
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

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editing ? "Editar funcionario" : "Agregar funcionario"}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
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
                        {editing && (
                            <FormControl fullWidth>
                                <InputLabel>Estado</InputLabel>
                                <Select value={form.estado} label="Estado" onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                                    <MenuItem value="A">Activo</MenuItem>
                                    <MenuItem value="E">Egresado</MenuItem>
                                    <MenuItem value="I">Inactivo</MenuItem>
                                </Select>
                            </FormControl>
                        )}
                        <FormControl fullWidth>
                            <InputLabel>Sector</InputLabel>
                            <Select
                                value={form.ley14411Industria ? "incluido" : "no_incluido"}
                                label="Sector"
                                onChange={(e) => setForm({
                                    ...form,
                                    industria: e.target.value === "incluido",
                                    ley14411Industria: e.target.value === "incluido"
                                })}
                            >
                                <MenuItem value="incluido">Incluido Ley 14411</MenuItem>
                                <MenuItem value="no_incluido">No incluido</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Categoría</InputLabel>
                            <Select
                                value={form.codCat}
                                label="Categoría"
                                onChange={(e) => setForm({ ...form, codCat: e.target.value })}
                            >
                                <MenuItem value="">Sin categoría</MenuItem>
                                {categorias.map((c) => (
                                    <MenuItem key={c.CodCat} value={c.CodCat}>{c.Descripcion}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, flexDirection: "column", alignItems: "stretch", gap: 1 }}>
                    {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                        <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                        <Button variant="contained" onClick={handleGuardar} disabled={saving}>
                            {saving ? <CircularProgress size={20} /> : "Guardar"}
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>
        </Box>
    );
}