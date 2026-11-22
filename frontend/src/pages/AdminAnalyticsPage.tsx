import React from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart as PieIcon, 
  ShieldCheck, 
  Download,
  Calendar,
  Layers
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

export const AdminAnalyticsPage: React.FC = () => {
  const trendData = [
    { week: 'Week 1', verified: 320, flagged: 45 },
    { week: 'Week 2', verified: 450, flagged: 52 },
    { week: 'Week 3', verified: 510, flagged: 60 },
    { week: 'Week 4', verified: 620, flagged: 78 },
    { week: 'Week 5', verified: 780, flagged: 65 },
  ];

  const programData = [
    { name: 'KCC Loans', count: 1240, color: '#4E6E3D' },
    { name: 'Paddy MSP', count: 850, color: '#B45309' },
    { name: 'PMFBY Insurance', count: 390, color: '#1D4ED8' },
  ];

  const districtData = [
    { district: 'Durg', count: 1248, rate: '88.3%' },
    { district: 'Raipur', count: 542, rate: '86.1%' },
    { district: 'Bilaspur', count: 391, rate: '87.0%' },
    { district: 'Rajnandgaon', count: 182, rate: '85.4%' },
    { district: 'Dhamtari', count: 117, rate: '89.2%' },
  ];

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Agricultural Verification Analytics
          </h1>
          <p className="text-xs text-gray-500">
            Audit trends, district distributions and program breakdown across Chhattisgarh
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white border border-warm-border text-xs font-semibold text-gray-700 shadow-soft hover:bg-sage-50"
        >
          <Download className="w-3.5 h-3.5 text-sage-600" />
          <span>Export Analytics Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Weekly Trend Line Chart */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-warm-border shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-warm-border pb-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">Weekly Verification Volume</h3>
              <p className="text-xs text-gray-500">Total farmer verifications processed per week</p>
            </div>
            <TrendingUp className="w-5 h-5 text-sage-600" />
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="verified" name="Verified Matches" stroke="#4E6E3D" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="flagged" name="Discrepancies Flagged" stroke="#C53030" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Program Breakdown Pie Chart */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-warm-border shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-warm-border pb-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">Program Distribution</h3>
              <p className="text-xs text-gray-500">By benefit channel</p>
            </div>
            <PieIcon className="w-5 h-5 text-sage-600" />
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={programData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {programData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* District Metrics Table */}
      <div className="bg-white rounded-3xl p-6 border border-warm-border shadow-card space-y-4">
        <h3 className="text-base font-bold text-gray-900">District Verification Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-warm-border text-gray-400 uppercase tracking-wider font-semibold text-[11px]">
                <th className="pb-3 pl-2">District</th>
                <th className="pb-3">Total Records Processed</th>
                <th className="pb-3">Verification Rate</th>
                <th className="pb-3 text-right pr-2">Audit Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-border/60">
              {districtData.map((d, i) => (
                <tr key={i} className="hover:bg-warm-bg/60 transition-colors">
                  <td className="py-3 pl-2 font-bold text-gray-900">{d.district}</td>
                  <td className="py-3 font-mono text-gray-700">{d.count}</td>
                  <td className="py-3 font-semibold text-[#2E7D32]">{d.rate}</td>
                  <td className="py-3 text-right pr-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-sage-50 text-sage-800 border border-sage-200 font-semibold text-[11px]">
                      Compliant
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
