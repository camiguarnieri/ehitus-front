import {
    Box, Typography, List, ListItem, ListItemButton,
    ListItemIcon, ListItemText, Collapse, IconButton,
    Avatar, Divider, useMediaQuery, useTheme, Drawer
} from "@mui/material";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import ApartmentIcon from "@mui/icons-material/Apartment";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TuneIcon from "@mui/icons-material/Tune";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import ConstructionIcon from "@mui/icons-material/Construction";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

const SIDEBAR_WIDTH = 240;

const navItems = [
    { label: "Funcionarios", path: "/funcionarios", icon: <PeopleAltIcon fontSize="small" /> },
    { label: "Usuarios", path: "/usuarios", icon: <ManageAccountsIcon fontSize="small" /> },
    { label: "Obras", path: "/obras", icon: <ApartmentIcon fontSize="small" /> },
    { label: "Carga horaria", path: "/carga-horaria", icon: <AccessTimeIcon fontSize="small" /> },
];

const configItems = [
    { label: "Parámetros carga horaria", path: "/parametros-carga", icon: <TuneIcon fontSize="small" /> },
    { label: "Parámetros cierre de mes", path: "/parametros-cierre", icon: <CalendarMonthIcon fontSize="small" /> },
];

function SidebarContent({ onNavigate }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [configOpen, setConfigOpen] = useState(false);
    const nombre = localStorage.getItem("nombre") || "Usuario";

    const handleNavigate = (path) => {
        navigate(path);
        if (onNavigate) onNavigate();
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const isActive = (path) => location.pathname === path;

    return (
        <Box sx={{
            width: SIDEBAR_WIDTH,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#111111",
        }}>
            {/* Logo */}
            <Box sx={{ px: 3, py: 2.5, display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{
                    width: 32, height: 32, borderRadius: 1.5,
                    backgroundColor: "#E8630A",
                    display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                    <ConstructionIcon sx={{ color: "#fff", fontSize: 18 }} />
                </Box>
                <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1rem", letterSpacing: 1 }}>
                    EHITUS
                </Typography>
            </Box>

            <Divider sx={{ borderColor: "#222" }} />

            {/* Nav */}
            <List sx={{ px: 1.5, pt: 1.5, flexGrow: 1 }}>
                {navItems.map((item) => (
                    <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            onClick={() => handleNavigate(item.path)}
                            sx={{
                                borderRadius: 2,
                                py: 1,
                                backgroundColor: isActive(item.path) ? "#E8630A" : "transparent",
                                "&:hover": {
                                    backgroundColor: isActive(item.path) ? "#E8630A" : "rgba(255,255,255,0.06)",
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 36, color: isActive(item.path) ? "#fff" : "#888" }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.label}
                                sx={{
                                    "& .MuiListItemText-primary": {
                                        fontSize: "0.875rem",
                                        fontWeight: isActive(item.path) ? 600 : 400,
                                        color: isActive(item.path) ? "#fff" : "#aaa",
                                    }
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}

                {/* Configuración collapsible */}
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                        onClick={() => setConfigOpen(!configOpen)}
                        sx={{
                            borderRadius: 2, py: 1,
                            "&:hover": { backgroundColor: "rgba(255,255,255,0.06)" },
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 36, color: "#888" }}>
                            <TuneIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                            primary="Configuración"
                            sx={{
                                "& .MuiListItemText-primary": {
                                    fontSize: "0.875rem",
                                    color: "#aaa",
                                }
                            }}
                        />
                        {configOpen
                            ? <ExpandLess sx={{ color: "#666", fontSize: 18 }} />
                            : <ExpandMore sx={{ color: "#666", fontSize: 18 }} />}
                    </ListItemButton>
                </ListItem>
                <Collapse in={configOpen} timeout="auto" unmountOnExit>
                    <List disablePadding sx={{ pl: 1 }}>
                        {configItems.map((item) => (
                            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                                <ListItemButton
                                    onClick={() => handleNavigate(item.path)}
                                    sx={{
                                        borderRadius: 2, py: 0.8,
                                        backgroundColor: isActive(item.path) ? "rgba(232,99,10,0.15)" : "transparent",
                                        "&:hover": { backgroundColor: "rgba(255,255,255,0.06)" },
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 32, color: isActive(item.path) ? "#E8630A" : "#666" }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.label}
                                        sx={{
                                            "& .MuiListItemText-primary": {
                                                fontSize: "0.8rem",
                                                color: isActive(item.path) ? "#E8630A" : "#aaa",
                                            }
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Collapse>
            </List>

            <Divider sx={{ borderColor: "#222" }} />

            {/* Usuario + logout */}
            <Box sx={{ px: 2, py: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar sx={{ width: 32, height: 32, backgroundColor: "#E8630A", fontSize: "0.8rem" }}>
                    {nombre.charAt(0).toUpperCase()}
                </Avatar>
                <Typography sx={{ color: "#888", fontSize: "0.8rem", flexGrow: 1 }} noWrap>
                    {nombre}
                </Typography>
                <IconButton onClick={handleLogout} size="small" sx={{ color: "#555", "&:hover": { color: "#E8630A" } }}>
                    <LogoutIcon fontSize="small" />
                </IconButton>
            </Box>
        </Box>
    );
}

export default function Layout({ children }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f0f0f0" }}>

            {/* Sidebar desktop */}
            {!isMobile && (
                <Box sx={{
                    width: SIDEBAR_WIDTH,
                    flexShrink: 0,
                    position: "fixed",
                    top: 0, left: 0,
                    height: "100vh",
                    zIndex: 100,
                    boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
                }}>
                    <SidebarContent />
                </Box>
            )}

            {/* Drawer mobile */}
            {isMobile && (
                <Drawer
                    anchor="left"
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    PaperProps={{ sx: { width: SIDEBAR_WIDTH, border: "none" } }}
                >
                    <SidebarContent onNavigate={() => setDrawerOpen(false)} />
                </Drawer>
            )}

            {/* Contenido principal */}
            <Box sx={{
                flexGrow: 1,
                ml: isMobile ? 0 : `${SIDEBAR_WIDTH}px`,
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
            }}>

                {/* Topbar mobile */}
                {isMobile && (
                    <Box sx={{
                        backgroundColor: "#111",
                        px: 2, py: 1.5,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                    }}>
                        <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: "#fff" }}>
                            <MenuIcon />
                        </IconButton>
                        <Typography sx={{ color: "#fff", fontWeight: 700, letterSpacing: 1 }}>
                            EHITUS
                        </Typography>
                    </Box>
                )}

                {/* Página */}
                <Box sx={{ p: { xs: 2, md: 3 }, flexGrow: 1 }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
}
