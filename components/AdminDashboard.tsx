import React from 'react';

const AdminSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-slate-800/50 border border-slate-700 rounded-lg">
    <h3 className="text-lg font-semibold text-emerald-400 p-4 border-b border-slate-700">{title}</h3>
    <div className="p-4">{children}</div>
  </div>
);

const mockUsers = [
  { id: 'u1', email: 'breeder1@example.com', status: 'Active', plan: 'Pro' },
  { id: 'u2', email: 'user2@example.com', status: 'Active', plan: 'Free' },
  { id: 'u3', email: 'test3@example.com', status: 'Suspended', plan: 'Free' },
];

const mockImportJobs = [
  { id: 'job-i1', type: 'individuals', status: 'succeeded', submittedAt: '2024-05-30 10:00', result: '28/30 success' },
  { id: 'job-i2', type: 'measurements', status: 'failed', submittedAt: '2024-05-29 14:20', result: 'Invalid date format on line 15' },
  { id: 'job-i3', type: 'individuals', status: 'running', submittedAt: '2024-05-30 11:05', result: 'Processing...' },
];

const mockExportJobs = [
    { id: 'job-e1', type: 'pedigree_pdf', status: 'completed', submittedAt: '2024-05-28 09:00', result: 'Download' },
    { id: 'job-e2', type: 'pedigree_pdf', status: 'pending', submittedAt: '2024-05-30 11:10', result: 'Queued' },
];

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const statusClasses: Record<string, string> = {
        succeeded: 'bg-emerald-800 text-emerald-300',
        completed: 'bg-emerald-800 text-emerald-300',
        failed: 'bg-red-800 text-red-300',
        running: 'bg-blue-800 text-blue-300 animate-pulse',
        pending: 'bg-yellow-800 text-yellow-300',
        Active: 'bg-green-800 text-green-300',
        Suspended: 'bg-gray-700 text-gray-300',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-slate-700'}`}>{status}</span>
}


export const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-8">
       <div>
            <h2 className="text-2xl font-bold tracking-tight">管理者ダッシュボード</h2>
            <p className="text-slate-400">アプリケーションの運用状況を確認・管理します。</p>
        </div>

      <AdminSection title="ユーザー管理">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase">
              <tr>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map(user => (
                <tr key={user.id} className="border-t border-slate-700">
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4"><StatusBadge status={user.status}/></td>
                  <td className="py-3 px-4">{user.plan}</td>
                  <td className="py-3 px-4">
                    <button className="text-red-400 hover:underline text-xs">Suspend</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminSection>

      <AdminSection title="CSVインポートジョブ">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase">
              <tr>
                <th className="py-3 px-4">Job ID</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4">Result</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockImportJobs.map(job => (
                <tr key={job.id} className="border-t border-slate-700">
                  <td className="py-3 px-4 font-mono">{job.id}</td>
                  <td className="py-3 px-4"><StatusBadge status={job.status}/></td>
                  <td className="py-3 px-4">{job.submittedAt}</td>
                  <td className="py-3 px-4 truncate max-w-xs">{job.result}</td>
                  <td className="py-3 px-4">
                    {job.status === 'failed' && <button className="text-emerald-400 hover:underline text-xs">Retry</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminSection>

      <AdminSection title="血統書エクスポートジョブ">
         <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase">
              <tr>
                <th className="py-3 px-4">Job ID</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4">Result</th>
              </tr>
            </thead>
            <tbody>
              {mockExportJobs.map(job => (
                <tr key={job.id} className="border-t border-slate-700">
                  <td className="py-3 px-4 font-mono">{job.id}</td>
                  <td className="py-3 px-4"><StatusBadge status={job.status}/></td>
                  <td className="py-3 px-4">{job.submittedAt}</td>
                  <td className="py-3 px-4">
                    {job.status === 'completed' ? <a href="#" className="text-emerald-400 hover:underline text-xs">{job.result}</a> : job.result}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminSection>
    </div>
  );
};
