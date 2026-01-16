import axiosInstance from "@/API/Configs/App.config";
import { DataRecord, KPIData } from "@/Types/Analytics.types";

// Pure helper: compute KPI aggregates from an array of records
export function computeKPIs(records: DataRecord[]): KPIData {
  const toNum = (v: any) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const totalEnquiries = records.reduce((s, r) => s + toNum((r as any).enquiries), 0);
  const convertedShipments = records.reduce(
    (s, r) => s + toNum((r as any).converted_shipments ?? (r as any).converted ?? 0),
    0
  );
  const totalShipments = records.reduce(
    (s, r) => s + toNum((r as any).total_shipments ?? (r as any).totalShipments ?? 0),
    0
  );
  const totalVolume = records.reduce((s, r) => s + toNum((r as any).volume), 0);
  const totalWeight = records.reduce((s, r) => s + toNum((r as any).weight), 0);

  const activeCustomers = new Set(
    records.map((r) => String((r as any).customer || "").trim())
  ).size;

  const conversionRate = totalEnquiries > 0 ? (convertedShipments / totalEnquiries) * 100 : 0;

  const result: KPIData = {
    totalEnquiries,
    convertedShipments,
    totalShipments,
    conversionRate: Math.round(conversionRate * 10) / 10,
    activeCustomers,
    totalVolume,
    totalWeight,
  };

  return result;
}

export const SalesPerformanceService = {
  // Fetch KPI summary - backend returns raw records; compute KPIs here
  async getKPISummary(period: string): Promise<KPIData> {
    const response = await axiosInstance.get<unknown>("/sales/kpi", {
      params: { period },
    });

    const payload = response.data as any;

    let records: DataRecord[] = [];

    if (Array.isArray(payload)) {
      records = payload as DataRecord[];
    } else if (payload && Array.isArray(payload.records)) {
      records = payload.records as DataRecord[];
    } else if (payload && Array.isArray(payload.data)) {
      records = payload.data as DataRecord[];
    } else {
      throw new Error("Unexpected response format from /sales/kpi");
    }

    return computeKPIs(records);
  },
  // Fetch and normalize raw records for dashboard consumption
  async getRecords(period: string) {
    const resp = await axiosInstance.get<unknown>("/sales/kpi", {
      params: { period },
    });

    const payload: any = resp.data;

    let records: any[] = [];
    if (Array.isArray(payload)) {
      records = payload;
    } else if (payload && Array.isArray(payload.records)) {
      records = payload.records;
    } else if (payload && Array.isArray(payload.data)) {
      records = payload.data;
    } else {
      records = [];
    }

    const toNum = (v: any) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    const normalized: DataRecord[] = records.map((r: any) => ({
      month:
        r.month ??
        (r.shipment_date
          ? (() => {
              try {
                const d = new Date(r.shipment_date);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
              } catch {
                return "";
              }
            })()
          : ""),
      enquiries: toNum(r.enquiries ?? r.enquiries_count ?? 0),
      converted_shipments: toNum(r.converted_shipments ?? r.converted ?? r.convertedShipments ?? 0),
      total_shipments: toNum(r.total_shipments ?? r.totalShipments ?? r.shipments ?? 0),
      volume: toNum(r.volume ?? r.vol ?? 0),
      weight: toNum(r.weight ?? r.wt ?? 0),
      customer: r.customer ?? r.customer_name ?? "",
      salesman: r.salesman ?? r.sales ?? "",
      agent: r.agent ?? "",
      country: r.country ?? "",
      branch: r.branch ?? "",
      service: r.service ?? "",
      trade: r.trade ?? "",
      tradelane: r.tradelane ?? "",
      carrier: r.carrier ?? "",
      product: r.product ?? "",
      tos: r.tos ?? "",
      shipment_date: r.shipment_date ?? r.shipmentDate ?? undefined,
    }));

    return normalized;
  },
};