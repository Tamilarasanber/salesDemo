// Filter slice for dashboard filter state
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FilterState } from "@/Types/Analytics.types";

const initialState: FilterState = {
  period: "last-6-months",
  country: [],
  branch: [],
  service: [],
  trade: [],
  customer: [],
  salesman: [],
  agent: [],
  carrier: [],
  tradelane: [],
  product: [],
  tos: [],
  chartFilters: {},
};

const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<FilterState>>) => {
      return { ...state, ...action.payload };
    },
    resetFilters: () => {
      return initialState;
    },
    setChartFilter: (
      state,
      action: PayloadAction<{ key: string; value: string | undefined }>
    ) => {
      const { key, value } = action.payload;
      if (value) {
        state.chartFilters[key] = value;
      } else {
        delete state.chartFilters[key];
      }
    },
    clearChartFilters: (state) => {
      state.chartFilters = {};
    },
    setPeriod: (state, action: PayloadAction<string>) => {
      state.period = action.payload;
    },
  },
});

export const {
  setFilters,
  resetFilters,
  setChartFilter,
  clearChartFilters,
  setPeriod,
} = filterSlice.actions;
export default filterSlice.reducer;
