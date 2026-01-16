// Dashboard styles (placeholder - using Tailwind for styling)
// This file can be used for MUI styled-components if needed

export const dashboardStyles = {
  container: {
    minHeight: "100vh",
  },
  header: {
    position: "sticky" as const,
    top: 0,
    zIndex: 50,
  },
  kpiSection: {
    marginBottom: "2rem",
  },
  chartSection: {
    marginBottom: "1.5rem",
  },
};

export default dashboardStyles;
