// Application routes configuration
import { Routes, Route } from "react-router-dom";

// Pages - modular structure (uppercase Pages folder)
import Login from "@/Pages/Login/LoginPage";
import Home from "@/Pages/Home/Home";
import SalesPerformance from "@/Pages/SalesPerformance/SalesPerformance";
import Reports from "@/Pages/Reports/Reports";
import Contact from "@/Pages/Contact/Contact";
import Demo from "@/Pages/Demo/Demo";
import Profile from "@/Pages/Profile/Profile";
import NotFound from "@/Pages/NotFound/NotFound";


const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/sales" element={<SalesPerformance />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="/profile" element={<Profile />} />
      {/* Catch-all route for 404 */}
      <Route path="*" element={<NotFound />} />
      
    </Routes>
  );
};

export default AppRoutes;
