import { useEffect, useMemo, useState } from "react";
import {
    Box, Typography, Button, Chip, TextField, InputAdornment,
    Dialog, DialogTitle, DialogContent, DialogActions,
    FormControl, InputLabel, Select, MenuItem, CircularProgress,
    Card, CardContent, useMediaQuery, useTheme, IconButton, Tooltip,
    List, ListItem, ListItemText, ListItemSecondaryAction, Divider,
    Alert
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PeopleIcon from "@mui/icons-material/People";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlined";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutlined";
import {
    createUsuario, deleteUsuario, getEmpresas, getUsuarios, updateUsuario,
    getTodosFuncionarios, getFuncionariosPorSupervisor, setFuncionariosPorSupervisor
} from "../../api/apiCalls";

const estadoLabel = { A: "Activo", I: "Inactivo" };
const estadoColor = { A: "success", I: "error" };
const emptyForm = { usuario: "", password: "", codEmp: "", nombre: "", estado: "A", rol: "supervisor" };

export default function UsuariosPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    // Estado principal
    const [rows, setRows] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");

    // Dialog ABM usuario
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    // Dialog asignación funcionarios
    const [asignOpen, setAsignOpen] = useState(false);
    const [asignUsuario, setAsignUsuario] = useState(null); // { Id, Usuario, Nombre }
    const [todosFuncionarios, setTodosFuncionarios] = useState([]);
    const [asignados, setAsignados] = useState([]); // codigos asignados (Set)
    const [asignSearch, setAsignSearch] = useState("");
    const [asignLoading, setAsignLoading] = useState(false);
    const [asignSaving, setAsignSaving] = useState(false);
    const [asignError, setAsignError] = useState("");

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

    // ── ABM usuario ──────────────────────────────────────────────
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
            rol: row.Rol || "supervisor",
        });
        setError("");
        setDialogOpen(true);
    };

    const handleGuardar = async () => {
        if (!form.usuario || !form.codEmp || (!editing && !form.password)) {
            setError(editing ? "Usuario y empresa son obligatorios" : "Usuario, password y empresa son obligatorios");
            return;
        }
        const payload = { usuario: form.usuario, codEmp: Number(form.codEmp), nombre: form.nombre, estado: form.estado, rol: form.rol };
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

    // ── Asignación funcionarios ──────────────────────────────────
    const openAsignacion = async (row) => {
        setAsignUsuario(row);
        setAsignSearch("");
        setAsignError("");
        setAsignOpen(true);
        setAsignLoading(true);
        try {
            const [todosRes, asignadosRes] = await Promise.all([
                getTodosFuncionarios(),
                getFuncionariosPorSupervisor(row.Id)
            ]);
            // Filtrar solo funcionarios de la misma empresa
            const funcionariosEmpresa = (todosRes.data || []).filter(f => f.CodEmp === row.CodEmp);
            setTodosFuncionarios(funcionariosEmpresa);
            const codigosAsignados = new Set((asignadosRes.data || []).map(f => f.Codigo));
            setAsignados(codigosAsignados);
        } catch {
            setAsignError("Error cargando funcionarios");
        } finally {
            setAsignLoading(false);
        }
    };

    const toggleAsignado = (codigo) => {
        setAsignados(prev => {
            const next = new Set(prev);
            if (next.has(codigo)) {
                next.delete(codigo);
            } else {
                next.add(codigo);
            }
            return next;
        });
    };

    const handleGuardarAsignacion = async () => {
        setAsignSaving(true);
        setAsignError("");
        try {
            await setFuncionariosPorSupervisor(asignUsuario.Id, Array.from(asignados));
            setAsignOpen(false);
        } catch (err) {
            setAsignError(err?.response?.data?.message || "Error guardando asignación");
        } finally {
            setAsignSaving(false);
        }
    };

    // Funcionarios filtrados por búsqueda en el modal
    const funcionariosFiltrados = useMemo(() => {
        if (!asignSearch) return todosFuncionarios;
        const q = asignSearch.toLowerCase();
        return todosFuncionarios.filter(f => {
            const nombre = `${f.Apellido1} ${f.Apellido2 || ''} ${f.Nombre1 || ''} ${f.CI || ''}`.toLowerCase();
            return nombre.includes(q);
        });
    }, [todosFuncionarios, asignSearch]);

    const asignadosList = funcionariosFiltrados.filter(f => asignados.has(f.Codigo));
    const noAsignadosList = funcionariosFiltrados.filter(f => !asignados.has(f.Codigo));

    const nombreFuncionario = (f) =>
        `${f.Apellido1 || ''} ${f.Apellido2 || ''}`.trim() + ', ' + `${f.Nombre1 || ''}`.trim();

    // ── Columnas DataGrid ────────────────────────────────────────
    const columns = [
        { field: "Id", headerName: "Id", width: 60 },
        { field: "Usuario", headerName: "Usuario", flex: 1, minWidth: 130 },
        { field: "Nombre", headerName: "Nombre", flex: 1, minWidth: 160 },
        { field: "Empresa", headerName: "Empresa", flex: 1, minWidth: 150 },
        {
            field: "Estado", headerName: "Estado", width: 100,
            renderCell: ({ value }) => (
                <Chip label={estadoLabel[value] || value} size="small" color={estadoColor[value] || "default"} />
            ),
        },
        {
            field: "Rol", headerName: "Rol", width: 120,
            renderCell: ({ value }) => (
                <Chip label={value === 'admin' ? 'Admin' : 'Supervisor'} size="small"
                    color={value === 'admin' ? 'primary' : 'default'} />
            )
        },
        {
            field: "acciones", headerName: "", width: 130, sortable: false, filterable: false,
            renderCell: ({ row }) => (
                <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Tooltip title="Funcionarios asignados">
                        <IconButton size="small" color="primary" onClick={() => openAsignacion(row)}>
                            <PeopleIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
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
                <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Agregar</Button>
            </Box>

            {error && <Typography color="error" fontSize="0.9rem" sx={{ mb: 2 }}>{error}</Typography>}

            <TextField
                placeholder="Buscar por usuario, nombre o empresa..."
                size="small" fullWidth value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ mb: 2 }}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
            />

            {/* ── Vista Mobile ── */}
            {isMobile ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {loading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>
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
                                    <Tooltip title="Funcionarios asignados">
                                        <IconButton size="small" color="primary" onClick={() => openAsignacion(r)}>
                                            <PeopleIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <IconButton size="small" onClick={() => openEdit(r)}><EditIcon fontSize="small" /></IconButton>
                                    <IconButton size="small" color="error" disabled={r.Estado === "I"} onClick={() => handleBaja(r)}><DeleteIcon fontSize="small" /></IconButton>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            ) : (
                /* ── Vista Desktop ── */
                <Box sx={{ backgroundColor: "#fff", borderRadius: 2, overflow: "hidden" }}>
                    <DataGrid
                        rows={filtered} columns={columns} getRowId={(row) => row.Id}
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

            {/* ── Dialog ABM usuario ── */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editing ? "Editar usuario" : "Agregar usuario"}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                        {error && <Typography color="error" fontSize="0.85rem">{error}</Typography>}
                        <TextField label="Usuario *" value={form.usuario} onChange={(e) => setForm({ ...form, usuario: e.target.value })} />
                        <TextField
                            label={editing ? "Password nuevo" : "Password *"}
                            type="password" value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                        />
                        <TextField label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
                        <FormControl fullWidth>
                            <InputLabel>Empresa *</InputLabel>
                            <Select value={form.codEmp} label="Empresa *" onChange={(e) => setForm({ ...form, codEmp: e.target.value })}>
                                {empresas.map((e) => <MenuItem key={e.CodEmp} value={e.CodEmp}>{e.Empresa}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Estado</InputLabel>
                            <Select value={form.estado} label="Estado" onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                                <MenuItem value="A">Activo</MenuItem>
                                <MenuItem value="I">Inactivo</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Rol</InputLabel>
                            <Select value={form.rol} label="Rol" onChange={(e) => setForm({ ...form, rol: e.target.value })}>
                                <MenuItem value="supervisor">Supervisor</MenuItem>
                                <MenuItem value="admin">Administrador</MenuItem>
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

            {/* ── Dialog asignación de funcionarios ── */}
            <Dialog open={asignOpen} onClose={() => setAsignOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Funcionarios de {asignUsuario?.Nombre || asignUsuario?.Usuario}
                </DialogTitle>
                <DialogContent>
                    {asignLoading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>
                    ) : (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 1 }}>
                            {asignError && <Alert severity="error">{asignError}</Alert>}

                            <TextField
                                placeholder="Buscar funcionario..."
                                size="small" fullWidth value={asignSearch}
                                onChange={(e) => setAsignSearch(e.target.value)}
                                slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
                            />

                            {/* Asignados */}
                            <Typography variant="subtitle2" fontWeight={700} color="success.main">
                                Asignados ({asignados.size})
                            </Typography>
                            {asignadosList.length === 0 ? (
                                <Typography color="text.secondary" fontSize="0.85rem">Ninguno</Typography>
                            ) : (
                                <List dense disablePadding sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
                                    {asignadosList.map((f, i) => (
                                        <Box key={f.Codigo}>
                                            {i > 0 && <Divider />}
                                            <ListItem>
                                                <ListItemText
                                                    primary={nombreFuncionario(f)}
                                                    secondary={`CI: ${f.CI}`}
                                                    primaryTypographyProps={{ fontSize: "0.9rem" }}
                                                    secondaryTypographyProps={{ fontSize: "0.8rem" }}
                                                />
                                                <ListItemSecondaryAction>
                                                    <Tooltip title="Quitar">
                                                        <IconButton size="small" color="error" onClick={() => toggleAsignado(f.Codigo)}>
                                                            <RemoveCircleOutlineIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                        </Box>
                                    ))}
                                </List>
                            )}

                            <Divider />

                            {/* Disponibles */}
                            <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                                Disponibles ({noAsignadosList.length})
                            </Typography>
                            {noAsignadosList.length === 0 ? (
                                <Typography color="text.secondary" fontSize="0.85rem">Todos asignados</Typography>
                            ) : (
                                <List dense disablePadding sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, maxHeight: 220, overflowY: "auto" }}>
                                    {noAsignadosList.map((f, i) => (
                                        <Box key={f.Codigo}>
                                            {i > 0 && <Divider />}
                                            <ListItem>
                                                <ListItemText
                                                    primary={nombreFuncionario(f)}
                                                    secondary={`CI: ${f.CI}`}
                                                    primaryTypographyProps={{ fontSize: "0.9rem" }}
                                                    secondaryTypographyProps={{ fontSize: "0.8rem" }}
                                                />
                                                <ListItemSecondaryAction>
                                                    <Tooltip title="Agregar">
                                                        <IconButton size="small" color="success" onClick={() => toggleAsignado(f.Codigo)}>
                                                            <AddCircleOutlineIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                        </Box>
                                    ))}
                                </List>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setAsignOpen(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={handleGuardarAsignacion} disabled={asignSaving || asignLoading}>
                        {asignSaving ? <CircularProgress size={20} /> : "Guardar"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}