// MUI Theme configuration (placeholder - using Tailwind for styling)
import { createTheme, ThemeOptions } from "@mui/material/styles";

const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    primary: {
      main: "#33475B", // twilight
    },
    secondary: {
      main: "#4A6583", // grey-blue
    },
    success: {
      main: "#00D458", // lime
    },
    error: {
      main: "#EF4444", // coral
    },
    background: {
      default: "#F8FAFC",
      paper: "#FFFFFF",
    },
  },
  typography: {
    fontFamily: "'Roboto', system-ui, sans-serif",
  },
  shape: {
    borderRadius: 8,
  },
};

const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: {
      main: "#4DC9FF", // azure
    },
    secondary: {
      main: "#4A6583", // grey-blue
    },
    success: {
      main: "#00D458", // lime
    },
    error: {
      main: "#EF4444", // coral
    },
    background: {
      default: "#1A2533",
      paper: "#243447",
    },
  },
  typography: {
    fontFamily: "'Roboto', system-ui, sans-serif",
  },
  shape: {
    borderRadius: 8,
  },
};

export const lightTheme = createTheme(lightThemeOptions);
export const darkTheme = createTheme(darkThemeOptions);

export const getMuiTheme = (mode: "light" | "dark") => {
  return mode === "dark" ? darkTheme : lightTheme;
};
