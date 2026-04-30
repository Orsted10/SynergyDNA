import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const DNARadarChart = ({ match }) => {
  if (!match) return null;

  const data = {
    labels: ['Tech Fit', 'Cult Res', 'Growth', 'Chemistry', 'Market'],
    datasets: [
      {
        label: 'DNA Match',
        data: [match.tech_score, match.cult_score, match.growth_score, match.chemistry_score, match.market_score],
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 2,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: 'rgba(79, 70, 229, 1)',
        pointHoverBackgroundColor: 'rgba(79, 70, 229, 1)',
        pointHoverBorderColor: '#ffffff',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    layout: {
      padding: 15 // Fixes cut-off labels
    },
    scales: {
      r: {
        angleLines: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        pointLabels: {
          color: '#475569',
          font: {
            family: "'Inter', sans-serif",
            size: 10,
            weight: 600,
          },
        },
        ticks: {
          display: false,
          min: 0,
          max: 100,
          stepSize: 20,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: {
          family: "'Inter', sans-serif",
        },
        bodyFont: {
          family: "'Inter', sans-serif",
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => `${context.label}: ${context.raw}%`
        }
      }
    },
  };

  return (
    <div style={{ width: '100%', maxWidth: '280px', margin: '0 auto' }}>
      <Radar data={data} options={options} />
    </div>
  );
};

export default DNARadarChart;
