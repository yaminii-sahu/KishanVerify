import React from 'react';
import { 
  TrendingUp, 
  Download,
  Layers
} from 'lucide-react';
import { 
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
    { name: 'KCC Loans', value: 1240, color: '#4A6538' },
    { name: 'Paddy MSP', value: 850, color: '#D97706' },
    { name: 'PMFBY Insurance', value: 390, color: '#2563EB' },
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
          <h1 className="text-xl sm:text-2xl font-bold text-charcoal tracking-tight">
            Agricultural Verification Analytics
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-0.5">
            Audit trends, district distributions and program breakdown across Chhattisgarh
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-tint text-forest border border-forest/15 text-xs font-semibold shadow-soft hover:bg-forest hover:text-white transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Analytics Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Weekly Trend Line Chart */}
        <div className="lg:col-span-8 bg-cream-surface rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-warm-border shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-warm-border pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-charcoal">Weekly Verification Volume</h3>
              <p className="text-xs text-charcoal-muted">Total farmer verifications processed per week</p>
            </div>
            <TrendingUp className="w-5 h-5 text-forest" />
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E5DA" />
                <XAxis dataKey="week" stroke="#6B7565" fontSize={11} />
                <YAxis stroke="#6B7565" fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="verified" name="Verified Matches" stroke="#4A6538" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="flagged" name="Discrepancies Flagged" stroke="#C0392B" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Program Breakdown Pie Chart */}
        <div className="lg:col-span-4 bg-cream-surface rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-warm-border shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-warm-border pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-charcoal">Program Breakdown</h3>
              <p className="text-xs text-charcoal-muted">By scheme category</p>
            </div>
            <Layers className="w-5 h-5 text-forest" />
          </div>

          <div className="h-64 sm:h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={programData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
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

      {/* District Coverage Table */}
      <div className="bg-cream-surface rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-warm-border shadow-card">
        <h3 className="text-sm sm:text-base font-bold text-charcoal mb-3">District Coverage & Verification Rate</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-warm-border text-charcoal-muted uppercase text-[10px] tracking-wider font-semibold">
                <th className="pb-2.5">District</th>
                <th className="pb-2.5 text-right">Total Cases</th>
                <th className="pb-2.5 text-right">Verification Match Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-border/50">
              {districtData.map((d) => (
                <tr key={d.district} className="hover:bg-cream/60">
                  <td className="py-2.5 font-bold text-charcoal">{d.district}</td>
                  <td className="py-2.5 text-right font-medium text-charcoal">{d.count.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 text-right font-bold text-status-eligible-text">{d.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
