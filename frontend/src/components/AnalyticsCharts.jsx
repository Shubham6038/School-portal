import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

export default function AnalyticsCharts() {
  const monthlyData = [
    { month: 'Apr', attendance: 92, fee: 85 },
    { month: 'May', attendance: 96, fee: 90 },
    { month: 'Jun', attendance: 88, fee: 70 },
    { month: 'Jul', attendance: 94, fee: 95 },
    { month: 'Aug', attendance: 97, fee: 98 }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="text-blue-400 w-4 h-4" /> Monthly Student Attendance Trend
            </h3>
            <p className="text-xs text-slate-400">Institutional Average: 94.2%</p>
          </div>
          <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            +3.4% High
          </span>
        </div>

        <div className="flex items-end justify-between gap-4 h-40 pt-6 px-2">
          {monthlyData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <span className="text-[10px] font-mono text-slate-400 font-bold">{d.attendance}%</span>
              <div
                style={{ height: `${d.attendance}%` }}
                className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all hover:brightness-125"
              ></div>
              <span className="text-xs font-bold text-slate-400 uppercase">{d.month}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="text-emerald-400 w-4 h-4" /> Fee Collection Recovery Ratio
            </h3>
            <p className="text-xs text-slate-400">Online vs Pending Dues Recovery</p>
          </div>
          <span className="text-xs font-bold font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
            98.5% Cleared
          </span>
        </div>

        <div className="flex items-end justify-between gap-4 h-40 pt-6 px-2">
          {monthlyData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <span className="text-[10px] font-mono text-emerald-400 font-bold">{d.fee}%</span>
              <div
                style={{ height: `${d.fee}%` }}
                className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-lg transition-all hover:brightness-125"
              ></div>
              <span className="text-xs font-bold text-slate-400 uppercase">{d.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
