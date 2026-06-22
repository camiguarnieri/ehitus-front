import { useEffect, useState } from "react";
import {
    Box, Typography, TextField, InputAdornment,
    Chip, Card, CardContent, useMediaQuery, useTheme, CircularProgress
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";
import SearchIcon from "@mui/icons-material/Search";
import { getObras } from "../../api/apiCalls";

const estadoLabel = { 1: "En ejecución", 2: "Finalizada" };
const estadoColor = { 1: "success", 2: "default" };

export default function ObrasPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        getObras()
            .then((res) => setRows(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const filtered = rows.filter((r) =>
        r.Descripcion.toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
        { field: "NumObra", headerName: "N°", width: 70 },
        { field: "Descripcion", headerName: "Descripción", flex: 1 },
        {
            field: "EstadoObra",
            headerName: "Estado",
            width: 140,
            renderCell: ({ value }) => (
                <Chip label={estadoLabel[value] || value} size="small" color={estadoColor[value] || "default"} />
            ),
        },
    ];

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={700}>Obras</Typography>
            </Box>

            <TextField
                placeholder="Buscar obra..."
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
                        <Card key={r.NumObra} variant="outlined" sx={{ borderRadius: 2 }}>
                            <CardContent sx={{ pb: "12px !important" }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography fontWeight={600}>{r.Descripcion}</Typography>
                                    <Chip label={estadoLabel[r.EstadoObra] || r.EstadoObra} size="small" color={estadoColor[r.EstadoObra] || "default"} />
                                </Box>
                                <Typography color="text.secondary" fontSize="0.85rem" mt={0.5}>N° obra: {r.NumObra}</Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            ) : (
                <Box sx={{ backgroundColor: "#fff", borderRadius: 2, overflow: "hidden" }}>
                    <DataGrid
                        rows={filtered}
                        columns={columns}
                        getRowId={(row) => row.NumObra}
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
        </Box>
    );
}