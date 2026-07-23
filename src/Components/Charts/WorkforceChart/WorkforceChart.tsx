import { useEffect, useMemo, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { getNiceAxisBounds } from './chartAxis';
import './WorkforceChart.scss';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  ChartDataLabels
);

interface WorkforceChartProps {
  labels: string[];
  values: number[];
}

const CHART_HEIGHT = 320;
const MONTH_COLUMN_WIDTH = 56;

// Both charts share these exact x tick settings so the bar-plotting area
// is the same height in each canvas and the gridlines line up.
const SHARED_X_TICKS = {
  maxRotation: 0,
  minRotation: 0,
  font: { size: 11 },
};

function WorkforceChart({ labels, values }: WorkforceChartProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { max, stepSize } = useMemo(
    () => getNiceAxisBounds(Math.max(0, ...values)),
    [values]
  );

  // Keep the first month in view whenever the date range changes, so the
  // chart never renders mid-scrolled with the first bar cut off.
  useEffect(() => {
    scrollRef.current?.scrollTo({ left: 0 });
  }, [labels]);

  const plotData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: 'Workforce (no. of people)',
          data: values,
          backgroundColor: '#1a3a6b',
          borderRadius: 4,
          maxBarThickness: 36,
        },
      ],
    }),
    [labels, values]
  );

  const axisData = useMemo(
    () => ({
      labels,
      datasets: [{ data: values, backgroundColor: 'transparent' }],
    }),
    [labels, values]
  );

  const plotOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: 0 },
      plugins: {
        legend: { display: false },
        datalabels: {
          anchor: 'end' as const,
          align: 'top' as const,
          color: '#111827',
          font: { weight: 600 as const, size: 11 },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: SHARED_X_TICKS,
        },
        y: {
          display: false,
          min: 0,
          max,
          ticks: { stepSize },
        },
      },
    }),
    [max, stepSize]
  );

  const axisOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: 0 },
      events: [],
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
        datalabels: { display: false },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { ...SHARED_X_TICKS, color: 'transparent' },
        },
        y: {
          min: 0,
          max,
          ticks: { stepSize, precision: 0, padding: 4, font: { size: 11 } },
          grid: { color: '#e8ecf4' },
          border: { display: false },
        },
      },
    }),
    [max, stepSize]
  );

  if (labels.length === 0) {
    return (
      <p className="wfc__empty-state">
        Choose a date range to see the workforce chart.
      </p>
    );
  }

  return (
    <div className="wfc">
      <div className="wfc__axis" style={{ height: CHART_HEIGHT }}>
        <Bar data={axisData} options={axisOptions} />
      </div>
      <div className="wfc__scroll" ref={scrollRef}>
        <div
          className="wfc__plot"
          style={{
            minWidth: Math.max(labels.length * MONTH_COLUMN_WIDTH, 420),
            height: CHART_HEIGHT,
          }}
        >
          <Bar data={plotData} options={plotOptions} />
        </div>
      </div>
    </div>
  );
}

export default WorkforceChart;
