import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

export const CHART_COLORS = {
  accent: "#3a6ea5",
  leaf: "#2e7d5b",
  amber: "#ffb627",
  rose: "#c1443d",
  ink: "#14213d",
  slate: "#8891a8",
};

export const baseFont = {
  family: "Inter, sans-serif",
  size: 11,
};
