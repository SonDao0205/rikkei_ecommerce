import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { adminDashboardApi } from "../../api/adminDashboardApi";
import type {
  AdminDashboardData,
  TimeRangeFilter,
  TrendMetricType,
} from "../../types/ecommerce";

interface AdminDashboardState {
  data: AdminDashboardData | null;
  timeRange: TimeRangeFilter;
  trendMetric: TrendMetricType;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  isExporting: boolean;
}

const initialState: AdminDashboardState = {
  data: null,
  timeRange: "today",
  trendMetric: "revenue",
  isLoading: false,
  error: null,
  lastUpdated: null,
  isExporting: false,
};

export const fetchDashboardMetrics = createAsyncThunk<
  AdminDashboardData,
  TimeRangeFilter | void,
  { rejectValue: string }
>("adminDashboard/fetchDashboardMetrics", async (timeRange, { getState, rejectWithValue }) => {
  try {
    const range = timeRange || (getState() as { adminDashboard: AdminDashboardState }).adminDashboard.timeRange;
    const data = await adminDashboardApi.fetchDashboardData(range);
    return data;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to load dashboard data";
    return rejectWithValue(errorMsg);
  }
});

export const exportDashboardReport = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("adminDashboard/exportDashboardReport", async (_, { getState, rejectWithValue }) => {
  try {
    const { timeRange } = (getState() as { adminDashboard: AdminDashboardState }).adminDashboard;
    const blob = await adminDashboardApi.exportReport(timeRange);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `marketpulse_dashboard_${timeRange}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Export report failed";
    return rejectWithValue(errorMsg);
  }
});

export const adminDashboardSlice = createSlice({
  name: "adminDashboard",
  initialState,
  reducers: {
    setTimeRange: (state, action: PayloadAction<TimeRangeFilter>) => {
      state.timeRange = action.payload;
    },
    setTrendMetric: (state, action: PayloadAction<TrendMetricType>) => {
      state.trendMetric = action.payload;
    },
    resetDashboardState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardMetrics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardMetrics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
        state.lastUpdated = new Date().toLocaleTimeString();
      })
      .addCase(fetchDashboardMetrics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Could not fetch dashboard metrics";
      })
      .addCase(exportDashboardReport.pending, (state) => {
        state.isExporting = true;
      })
      .addCase(exportDashboardReport.fulfilled, (state) => {
        state.isExporting = false;
      })
      .addCase(exportDashboardReport.rejected, (state) => {
        state.isExporting = false;
      });
  },
});

export const { setTimeRange, setTrendMetric, resetDashboardState } = adminDashboardSlice.actions;
export default adminDashboardSlice.reducer;
