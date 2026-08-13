import "../../lib/chartSetup";
import { Bar } from "react-chartjs-2";
import { CHART_COLORS, baseFont } from "../../lib/chartSetup";

export default function StudentBarChart({ data }) {
  const chartData = {
    labels: data.map((d) => d.name.split(" ")[0]),
    datasets: [
      {
        label: "Responses",
        data: data.map((d) => d.count),
        backgroundColor: CHART_COLORS.accent,
        borderRadius: 6,
        maxBarThickness: 34,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: CHART_COLORS.ink,
        padding: 10,
        titleFont: baseFont,
        bodyFont: baseFont,
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: baseFont } },
      y: {
        beginAtZero: true,
        ticks: { precision: 0, font: baseFont },
        grid: { color: "#edeae1" },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
}
