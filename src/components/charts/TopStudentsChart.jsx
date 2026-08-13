import "../../lib/chartSetup";
import { Doughnut } from "react-chartjs-2";
import { baseFont } from "../../lib/chartSetup";

const PALETTE = ["#3a6ea5", "#2e7d5b", "#ffb627", "#c1443d", "#8891a8"];

export default function TopStudentsChart({ data }) {
  const top = data.slice(0, 5);
  const chartData = {
    labels: top.map((d) => d.name.split(" ")[0]),
    datasets: [
      {
        data: top.map((d) => d.count),
        backgroundColor: PALETTE,
        borderWidth: 3,
        borderColor: "#ffffff",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "62%",
    plugins: {
      legend: {
        position: "bottom",
        labels: { font: baseFont, boxWidth: 10, padding: 14 },
      },
      tooltip: {
        backgroundColor: "#14213d",
        padding: 10,
        callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed} responses` },
      },
    },
  };

  return <Doughnut data={chartData} options={options} />;
}
