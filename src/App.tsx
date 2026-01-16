import { Toaster } from "@/Components/ui/toaster";
import { Toaster as Sonner } from "@/Components/ui/sonner";
import { TooltipProvider } from "@/Components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { DashboardDataProvider } from "@/Store/contexts/DashboardDataContext";
import { ThemeProvider } from "@/Store/contexts/ThemeContext";
import { store } from "@/Store";
import AppRoutes from "@/routes";
import theme from "@/Theme/theme";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <ThemeProvider>
          <DashboardDataProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </TooltipProvider>
          </DashboardDataProvider>
        </ThemeProvider>
      </MuiThemeProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
