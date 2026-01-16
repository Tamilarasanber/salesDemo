import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, DollarSign, PieChart, Clock, Warehouse } from "lucide-react";
import { Button } from "@/Components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/Components/ui/dialog";
import { useDashboardData } from "@/Store/contexts/DashboardDataContext";
import Header from "@/Components/Layout/Header";

const dashboards = [
  {
    id: "sales",
    title: "Sales Performance",
    description:
      "Track enquiries, conversions, and shipment trends across all channels",
    icon: TrendingUp,
    path: "/sales",
    color: "azure",
  },
  {
    id: "profitability",
    title: "Job Profitability",
    description: "Analyze profit margins by job, customer, and service type",
    icon: DollarSign,
    path: "/profitability",
    color: "lime",
  },
  {
    id: "pnl",
    title: "Profit & Loss",
    description: "Comprehensive P&L statements with drill-down capabilities",
    icon: PieChart,
    path: "/pnl",
    color: "twilight",
  },
  {
    id: "ageing",
    title: "Ageing Analysis",
    description: "Monitor receivables and payables ageing across periods",
    icon: Clock,
    path: "/ageing",
    color: "coral",
  },
  {
    id: "warehouse",
    title: "Warehouse",
    description: "Inventory levels, movements, and space utilization metrics",
    icon: Warehouse,
    path: "/warehouse",
    color: "grey-blue",
  },
 
];

const colorMap: Record<string, string> = {
  azure:
    "bg-azure/10 text-azure group-hover:bg-azure group-hover:text-primary-foreground",
  lime: "bg-lime/10 text-lime group-hover:bg-lime group-hover:text-primary-foreground",
  twilight:
    "bg-twilight/10 text-twilight group-hover:bg-twilight group-hover:text-primary-foreground",
  coral:
    "bg-coral/10 text-coral group-hover:bg-coral group-hover:text-primary-foreground",
  "grey-blue":
    "bg-grey-blue/10 text-grey-blue group-hover:bg-grey-blue group-hover:text-primary-foreground",
};

const Home = () => {
  const navigate = useNavigate();
  // Upload feature removed; data is fetched from API

  return (
    
    <div className="min-h-screen bg-background">
      <Header logoOnly showAdminProfile />

      <main className="w-full max-w-[1600px] mx-auto px-6 py-10">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Dashboard Hub
          </h2>
          <p className="text-muted-foreground">
            Select a dashboard to view analytics and insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboards.map((dashboard, index) => {
            const Icon = dashboard.icon;
            return (
              <div
                key={dashboard.id}
                onClick={() => navigate(dashboard.path)}
                className={`dashboard-card group animate-fade-up stagger-${
                  index + 1
                }`}
                style={{ opacity: 0 }}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${
                    colorMap[dashboard.color]
                  }`}
                >
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-azure transition-colors">
                  {dashboard.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {dashboard.description}
                </p>
              </div>
            );
          })}
        </div>
      </main>

      {/* Upload UI removed */}
    </div>
  );
};

export default Home;
