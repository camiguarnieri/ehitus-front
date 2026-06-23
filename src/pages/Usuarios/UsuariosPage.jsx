import { useEffect, useMemo, useState } from "react";
import {
    Box, Typography, Button, Chip, TextField, InputAdornment,
    Dialog, DialogTitle, DialogContent, DialogActions,
    FormControl, InputLabel, Select, MenuItem, CircularProgress,
    Card, CardContent, useMediaQuery, useTheme, IconButton, Tooltip
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { createUsuario, deleteUsuario, getEmpresas, getUsuarios, updateUsuario } from "../../api/apiCalls";

const estadoLabel = { A: "Activo", I: "Inactivo" };
const estadoColor = { A: "success", I: "error" };

const emptyForm = { usuario: "", password: "", codEmp: "", nombre: "", estado: "A" };

export default function UsuariosPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [rows, setRows] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const cargar = async () => {
        setLoading(true);
        try {
            const [usuariosRes, empresasRes] = await Promise.all([getUsuarios(), getEmpresas()]);
            setRows(usuariosRes.data || []);
            setEmpresas(empresasRes.data || []);
        } catch {
            setError("Error cargando usuarios");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargar(); }, []);

    const filtered = useMemo(() => rows.filter((r) => {
        const texto = `${r.Usuario} ${r.Nombre} ${r.Empresa} ${r.CodEmp}`.toLowerCase();
        return texto.includes(search.toLowerCase());
    }), [rows, search]);

    const openCreate = () => {
        setEditing(null);
        setForm({ ...emptyForm, codEmp: empresas[0]?.CodEmp || "" });
        setError("");
        setDialogOpen(true);
    };

    const openEdit = (row) => {
        setEditing(row);
        setForm({
            usuario: row.Usuario || "",
            password: "",
            codEmp: row.CodEmp || "",
            nombre: row.Nombre || "",
            estado: row.Estado || "A",
        });
        setError("");
        setDialogOpen(true);
    };

    const handleGuardar = async () => {
        if (!form.usuario || !form.codEmp || (!editing && !form.password)) {
            setError(editing ? "Usuario y empresa son obligatorios" : "Usuario, password y empresa son obligatorios");
            return;
        }

        const payload = {
            usuario: form.usuario,
            codEmp: Number(form.codEmp),
            nombre: form.nombre,
            estado: form.estado,
        };

        if (form.password) payload.password = form.password;

        setSaving(true);
        setError("");
        try {
            if (editing) {
                await updateUsuario(editing.Id, payload);
            } else {
                await createUsuario(payload);
            }
            setDialogOpen(false);
            setForm(emptyForm);
            setEditing(null);
            await cargar();
        } catch (err) {
            setError(err?.response?.data?.message || "Error guardando usuario");
        } finally {
            setSaving(false);
        }
    };

    const handleBaja = async (row) => {
        if (!window.confirm(`Dar de baja al usuario ${row.Usuario}?`)) return;
        setError("");
        try {
            await deleteUsuario(row.Id);
            await cargar();
        } catch (err) {
            setError(err?.response?.data?.message || "Error dando de baja usuario");
        }
    };

    const columns = [
        { field: "Id", headerName: "Id", width: 80 },
        { field: "Usuario", headerName: "Usuario", flex: 1, minWidth: 140 },
        { field: "Nombre", headerName: "Nombre", flex: 1, minWidth: 180 },
        { field: "Empresa", headerName: "Empresa", flex: 1, minWidth: 160 },
        {
            field: "Estado",
            headerName: "Estado",
            width: 110,
            renderCell: ({ value }) => (
                <Chip label={estadoLabel[value] || value} size="small" color={estadoColor[value] || "default"} />
            ),
        },
        {
            field: "acciones",
            headerName: "",
            width: 100,
            sortable: false,
            filterable: false,
            renderCell: ({ row }) => (
                <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => openEdit(row)}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Dar de baja">
                        <span>
                            <IconButton size="small" color="error" disabled={row.Estado === "I"} onClick={() => handleBaja(row)}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Box>
            ),
        },
    ];

    return (
        <Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 2 }}>
                <Typography variant="h5" fontWeight={700}>Usuarios</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
                    Agregar
                </Button>
            </Box>

            {error && <Typography color="error" fontSize="0.9rem" sx={{ mb: 2 }}>{error}</Typography>}

            <TextField
                placeholder="Buscar por usuario, nombre o empresa..."
                size="small"
                fullWidth
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ mb: 2 }}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
            />

            {isMobile ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {loading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : filtered.length === 0 ? (
                        <Typography color="text.secondary" textAlign="center" py={4}>Sin resultados</Typography>
                    ) : filtered.map((r) => (
                        <Card key={r.Id} variant="outlined" sx={{ borderRadius: 2 }}>
                            <CardContent sx={{ pb: "12px !important" }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mb: 0.5 }}>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography fontWeight={600} fontSize="0.95rem" noWrap>{r.Usuario}</Typography>
                                        <Typography color="text.secondary" fontSize="0.85rem" noWrap>{r.Nombre}</Typography>
                                    </Box>
                                    <Chip label={estadoLabel[r.Estado] || r.Estado} size="small" color={estadoColor[r.Estado] || "default"} />
                                </Box>
                                <Typography color="text.secondary" fontSize="0.85rem">Empresa: {r.Empresa || r.CodEmp}</Typography>
                                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5, mt: 1 }}>
                                    <IconButton size="small" onClick={() => openEdit(r)}><EditIcon fontSize="small" /></IconButton>
                                    <IconButton size="small" color="error" disabled={r.Estado === "I"} onClick={() => handleBaja(r)}><DeleteIcon fontSize="small" /></IconButton>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            ) : (
                <Box sx={{ backgroundColor: "#fff", borderRadius: 2, overflow: "hidden" }}>
                    <DataGrid
                        rows={filtered}
                        columns={columns}
                        getRowId={(row) => row.Id}
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

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editing ? "Editar usuario" : "Agregar usuario"}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                        {error && <Typography color="error" fontSize="0.85rem">{error}</Typography>}
                        <TextField label="Usuario *" value={form.usuario} onChange={(e) => setForm({ ...form, usuario: e.target.value })} />
                        <TextField
                            label={editing ? "Password nuevo" : "Password *"}
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                        />
                        <TextField label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
                        <FormControl fullWidth>
                            <InputLabel>Empresa *</InputLabel>
                            <Select value={form.codEmp} label="Empresa *" onChange={(e) => setForm({ ...form, codEmp: e.target.value })}>
                                {empresas.map((empresa) => (
                                    <MenuItem key={empresa.CodEmp} value={empresa.CodEmp}>{empresa.Empresa}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Estado</InputLabel>
                            <Select value={form.estado} label="Estado" onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                                <MenuItem value="A">Activo</MenuItem>
                                <MenuItem value="I">Inactivo</MenuItem>
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
