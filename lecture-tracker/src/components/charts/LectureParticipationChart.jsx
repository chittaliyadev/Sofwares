import "../../lib/chartSetup";
import { Bar } from "react-chartjs-2";
import { CHART_COLORS, baseFont } from "../../lib/chartSetup";

export default function LectureParticipationChart({ data }) {
  const top = data.slice(0, 6);
  const chartData = {
    labels: top.map((d) => d.name),
    datasets: [
      {
        label: "Participation %",
        data: top.map((d) => d.rate),
        backgroundColor: CHART_COLORS.leaf,
        borderRadius: 6,
        maxBarThickness: 22,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: CHART_COLORS.ink,
        padding: 10,
        callbacks: { label: (ctx) => `${ctx.parsed.x}% participation` },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        ticks: { font: baseFont, callback: (v) => `${v}%` },
        grid: { color: "#edeae1" },
      },
      y: { grid: { display: false }, ticks: { font: baseFont } },
    },
  };

  return <Bar data={chartData} options={options} />;
}
