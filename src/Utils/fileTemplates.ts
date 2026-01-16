import * as XLSX from "xlsx";
import { DataRecord } from "@/Store/contexts/DashboardDataContext";
import { toast } from "@/Utils/useToast";

const EXCEL_HEADERS = [
  "Month",
  "Enquiry_Count",
  "Converted_Shipments",
  "Total_Shipments",
  "Volume",
  "Weight",
  "Customer",
  "Salesman",
  "Agent",
  "Country",
  "Branch",
  "Service",
  "Trade",
  "Tradelane",
  "Carrier",
  "Product",
  "TOS",
  "Shipment_Date",
];

export const downloadExcelTemplate = () => {
  try {
    const workbook = XLSX.utils.book_new();

    // Create worksheet with header row only
    const ws = XLSX.utils.aoa_to_sheet([EXCEL_HEADERS]);
    // Set column widths
    ws["!cols"] = EXCEL_HEADERS.map(() => ({ wch: 18 }));

    XLSX.utils.book_append_sheet(workbook, ws, "Sales_Performance_Data");

    // Generate and download
    XLSX.writeFile(workbook, "Newage_Sales_Performance_Template.xlsx");
  } catch (error) {
    console.error("Error downloading Excel template:", error);
    toast({
      title: "Error",
      description: "Unable to download template. Please try again.",
      variant: "destructive",
    });
  }
};

export const downloadJsonTemplate = () => {
  try {
    const template = {
      metadata: {
        period: "Last 6 Months",
        uploaded_by: "",
        uploaded_on: "YYYY-MM-DD",
      },
      records: [
        {
          month: "YYYY-MM",
          enquiries: 0,
          converted_shipments: 0,
          total_shipments: 0,
          volume: 0,
          weight: 0,
          customer: "",
          salesman: "",
          agent: "",
          country: "",
          branch: "",
          service: "",
          trade: "",
          tradelane: "",
          carrier: "",
          product: "",
          tos: "",
          shipment_date: "YYYY-MM-DD",
        },
      ],
    };

    const blob = new Blob([JSON.stringify(template, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Newage_Sales_Performance_Template.json";
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading JSON template:", error);
    toast({
      title: "Error",
      description: "Unable to download template. Please try again.",
      variant: "destructive",
    });
  }
};

interface ValidationResult {
  valid: boolean;
  data?: DataRecord[];
  error?: string;
}

export const parseExcelFile = async (file: File): Promise<ValidationResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        }) as any[][];

        if (jsonData.length < 2) {
          resolve({
            valid: false,
            error: "File is empty or has only headers.",
          });
          return;
        }

        const headers = jsonData[0] as string[];

        // Validate required headers
        const missingHeaders = EXCEL_HEADERS.filter(
          (h) => !headers.some((hdr) => hdr?.toLowerCase() === h.toLowerCase())
        );

        if (missingHeaders.length > 0) {
          resolve({
            valid: false,
            error: `Missing required columns: ${missingHeaders.join(", ")}`,
          });
          return;
        }

        // Map header indices
        const headerMap: Record<string, number> = {};
        headers.forEach((h, i) => {
          const normalized = EXCEL_HEADERS.find(
            (eh) => eh.toLowerCase() === h?.toLowerCase()
          );
          if (normalized) headerMap[normalized] = i;
        });

        // Parse rows
        const records: DataRecord[] = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length === 0) continue;

          const month = String(row[headerMap["Month"]] || "");

          // Validate month format (YYYY-MM)
          if (!/^\d{4}-\d{2}$/.test(month) && month !== "") {
            resolve({
              valid: false,
              error: `Invalid month format at row ${i + 1}. Expected YYYY-MM.`,
            });
            return;
          }

          records.push({
            month: month,
            enquiries: Number(row[headerMap["Enquiry_Count"]]) || 0,
            converted_shipments:
              Number(row[headerMap["Converted_Shipments"]]) || 0,
            total_shipments: Number(row[headerMap["Total_Shipments"]]) || 0,
            volume: Number(row[headerMap["Volume"]]) || 0,
            weight: Number(row[headerMap["Weight"]]) || 0,
            customer: String(row[headerMap["Customer"]] || ""),
            salesman: String(row[headerMap["Salesman"]] || ""),
            agent: String(row[headerMap["Agent"]] || ""),
            country: String(row[headerMap["Country"]] || ""),
            branch: String(row[headerMap["Branch"]] || ""),
            service: String(row[headerMap["Service"]] || ""),
            trade: String(row[headerMap["Trade"]] || ""),
            tradelane: String(row[headerMap["Tradelane"]] || ""),
            carrier: String(row[headerMap["Carrier"]] || ""),
            product: String(row[headerMap["Product"]] || ""),
            tos: String(row[headerMap["TOS"]] || ""),
            shipment_date: String(row[headerMap["Shipment_Date"]] || ""),
          });
        }

        if (records.length === 0) {
          resolve({ valid: false, error: "No valid data rows found." });
          return;
        }

        resolve({ valid: true, data: records });
      } catch (error) {
        console.error("Excel parse error:", error);
        resolve({
          valid: false,
          error: "Invalid template. Please upload using the provided format.",
        });
      }
    };

    reader.onerror = () => {
      resolve({ valid: false, error: "Failed to read file." });
    };

    reader.readAsArrayBuffer(file);
  });
};

export const parseJsonFile = async (file: File): Promise<ValidationResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const json = JSON.parse(content);

        if (!json.records || !Array.isArray(json.records)) {
          resolve({
            valid: false,
            error: "Invalid JSON structure. Missing 'records' array.",
          });
          return;
        }

        const records: DataRecord[] = json.records.map((r: any) => ({
          month: String(r.month || ""),
          enquiries: Number(r.enquiries) || 0,
          converted_shipments: Number(r.converted_shipments) || 0,
          total_shipments: Number(r.total_shipments) || 0,
          volume: Number(r.volume) || 0,
          weight: Number(r.weight) || 0,
          customer: String(r.customer || ""),
          salesman: String(r.salesman || ""),
          agent: String(r.agent || ""),
          country: String(r.country || ""),
          branch: String(r.branch || ""),
          service: String(r.service || ""),
          trade: String(r.trade || ""),
          tradelane: String(r.tradelane || ""),
          carrier: String(r.carrier || ""),
          product: String(r.product || ""),
          tos: String(r.tos || ""),
          shipment_date: String(r.shipment_date || ""),
        }));

        // Filter out empty template rows
        const validRecords = records.filter(
          (r) =>
            r.month &&
            r.month !== "YYYY-MM" &&
            (r.enquiries > 0 || r.total_shipments > 0)
        );

        if (validRecords.length === 0) {
          resolve({ valid: false, error: "No valid data rows found." });
          return;
        }

        resolve({ valid: true, data: validRecords });
      } catch (error) {
        console.error("JSON parse error:", error);
        resolve({
          valid: false,
          error: "Invalid template. Please upload using the provided format.",
        });
      }
    };

    reader.onerror = () => {
      resolve({ valid: false, error: "Failed to read file." });
    };

    reader.readAsText(file);
  });
};

export const parseCsvFile = async (file: File): Promise<ValidationResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split("\n").filter((line) => line.trim());

        if (lines.length < 2) {
          resolve({
            valid: false,
            error: "File is empty or has only headers.",
          });
          return;
        }

        const headers = lines[0].split(",").map((h) => h.trim());

        // Validate required headers
        const missingHeaders = EXCEL_HEADERS.filter(
          (h) => !headers.some((hdr) => hdr.toLowerCase() === h.toLowerCase())
        );

        if (missingHeaders.length > 0) {
          resolve({
            valid: false,
            error: `Missing required columns: ${missingHeaders.join(", ")}`,
          });
          return;
        }

        // Map header indices
        const headerMap: Record<string, number> = {};
        headers.forEach((h, i) => {
          const normalized = EXCEL_HEADERS.find(
            (eh) => eh.toLowerCase() === h.toLowerCase()
          );
          if (normalized) headerMap[normalized] = i;
        });

        // Parse rows
        const records: DataRecord[] = [];
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(",").map((v) => v.trim());
          if (row.length < 2) continue;

          const month = row[headerMap["Month"]] || "";

          records.push({
            month: month,
            enquiries: Number(row[headerMap["Enquiry_Count"]]) || 0,
            converted_shipments:
              Number(row[headerMap["Converted_Shipments"]]) || 0,
            total_shipments: Number(row[headerMap["Total_Shipments"]]) || 0,
            volume: Number(row[headerMap["Volume"]]) || 0,
            weight: Number(row[headerMap["Weight"]]) || 0,
            customer: row[headerMap["Customer"]] || "",
            salesman: row[headerMap["Salesman"]] || "",
            agent: row[headerMap["Agent"]] || "",
            country: row[headerMap["Country"]] || "",
            branch: row[headerMap["Branch"]] || "",
            service: row[headerMap["Service"]] || "",
            trade: row[headerMap["Trade"]] || "",
            tradelane: row[headerMap["Tradelane"]] || "",
            carrier: row[headerMap["Carrier"]] || "",
            product: row[headerMap["Product"]] || "",
            tos: row[headerMap["TOS"]] || "",
            shipment_date: row[headerMap["Shipment_Date"]] || "",
          });
        }

        if (records.length === 0) {
          resolve({ valid: false, error: "No valid data rows found." });
          return;
        }

        resolve({ valid: true, data: records });
      } catch (error) {
        console.error("CSV parse error:", error);
        resolve({
          valid: false,
          error: "Invalid template. Please upload using the provided format.",
        });
      }
    };

    reader.onerror = () => {
      resolve({ valid: false, error: "Failed to read file." });
    };

    reader.readAsText(file);
  });
};

export const parseUploadedFile = async (
  file: File
): Promise<ValidationResult> => {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "xlsx" || extension === "xls") {
    return parseExcelFile(file);
  } else if (extension === "json") {
    return parseJsonFile(file);
  } else if (extension === "csv") {
    return parseCsvFile(file);
  } else {
    return {
      valid: false,
      error: "Unsupported file type. Please use CSV, XLSX, or JSON.",
    };
  }
};
