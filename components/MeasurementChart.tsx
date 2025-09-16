import React from 'react';
import type { Measurement } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MeasurementChartProps {
  measurements: Measurement[];
}

export const MeasurementChart: React.FC<MeasurementChartProps> = ({ measurements }) => {
  if (measurements.length < 2) {
    return <div className="text-center text-slate-400 py-10">計測データが不足しているため、グラフを表示できません。</div>;
  }
  
  const data = measurements
    .filter(m => m.weightG !== undefined)
    .sort((a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime())
    .map(m => ({
      name: new Date(m.measuredAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
      weight: m.weightG,
    }));

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
          <YAxis 
            stroke="#9ca3af" 
            fontSize={12} 
            domain={[dataMin => (Math.floor(dataMin) - 2), dataMax => (Math.ceil(dataMax) + 2)]} 
            label={{ value: '体重 (g)', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#e5e7eb' }}
            labelStyle={{ color: '#9ca3af' }}
          />
          <Legend wrapperStyle={{fontSize: "12px"}}/>
          <Line type="monotone" dataKey="weight" name="体重" stroke="#10b981" strokeWidth={2} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};