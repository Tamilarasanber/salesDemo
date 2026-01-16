// Global MUI Theme configuration
import { createTheme, ThemeOptions } from "@mui/material/styles";

const baseThemeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#546E7A",
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Inter', system-ui, sans-serif",
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        size: "small",
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },
  },
};

export const theme = createTheme(baseThemeOptions);

export default theme;
