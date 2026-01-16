// Reports page (placeholder for future implementation)
import { useState } from "react";
import { FileText, Download, Calendar, Filter } from "lucide-react";
import { Button } from "@/Components/ui/button";
import Header from "@/Components/Layout/Header";

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const reports = [
    {
      id: "sales-summary",
      title: "Sales Summary",
      description: "Monthly sales performance overview",
    },
    {
      id: "customer-analysis",
      title: "Customer Analysis",
      description: "Top customers and trends",
    },
    {
      id: "shipment-details",
      title: "Shipment Details",
      description: "Detailed shipment records",
    },
    {
      id: "agent-performance",
      title: "Agent Performance",
      description: "Agent metrics and rankings",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header title="Reports" subtitle="Generate & Export" />

      {/* Content */}
      <main className="w-full max-w-[1600px] mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Available Reports
          </h2>
          <p className="text-muted-foreground">
            Select a report type to generate and export
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reports.map((report) => (
            <div
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`dashboard-card ${
                selectedReport === report.id ? "ring-2 ring-azure" : ""
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-azure/10 text-azure flex items-center justify-center mb-4">
                <FileText size={24} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {report.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {report.description}
              </p>
            </div>
          ))}
        </div>

        {selectedReport && (
          <div className="mt-8 p-6 bg-card rounded-xl border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Report Options
            </h3>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="gap-2">
                <Calendar size={16} />
                Date Range
              </Button>
              <Button variant="outline" className="gap-2">
                <Filter size={16} />
                Filters
              </Button>
              <Button className="gap-2 bg-azure text-accent-foreground hover:bg-azure/90">
                <Download size={16} />
                Generate Report
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              This feature is under development. Report generation will be
              available soon.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Reports;
