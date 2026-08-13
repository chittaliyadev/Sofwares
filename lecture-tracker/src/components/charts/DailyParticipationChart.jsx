import "../../lib/chartSetup";
import { Line } from "react-chartjs-2";
import { CHART_COLORS, baseFont } from "../../lib/chartSetup";

export default function DailyParticipationChart({ data }) {
  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        label: "Responses",
        data: data.map((d) => d.count),
        borderColor: CHART_COLORS.amber,
        backgroundColor: "rgba(255,182,39,0.18)",
        pointBackgroundColor: CHART_COLORS.amber,
        pointRadius: 4,
        tension: 0.35,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: CHART_COLORS.ink, padding: 10 },
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

  return <Line data={chartData} options={options} />;
}
