import { createTheme } from "@mui/material";

export const ehitusTheme = createTheme({
    palette: {
        primary: { main: "#E8630A" },
        secondary: { main: "#1a1a1a" },
        background: { default: "#f0f0f0" },
    },
    typography: {
        fontFamily: "'Inter', 'Roboto', sans-serif",
    },
    shape: { borderRadius: 8 },
    components: {
        MuiButton: {
            styleOverrides: {
                root: { textTransform: "none", fontWeight: 600 },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: { backgroundImage: "none" },
            },
        },
    },
});