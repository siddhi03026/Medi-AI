import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function TrustTimelineChart({ timeline = [] }) {
  if (!timeline.length) {
    return <p className="text-sm text-slate-500">No timeline data available.</p>;
  }

  const chartData = timeline.map((point) => ({
    date: new Date(point.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    score: point.score,
  }));

  return (
    <div className="h-32 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis dataKey="date" hide />
          <YAxis domain={[0, 100]} hide />
          <Tooltip />
          <Line type="monotone" dataKey="score" stroke="#0f6ba8" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
