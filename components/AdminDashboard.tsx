import React, { useState, useMemo } from 'react';
import { SearchIcon, UserIcon, ArrowPathIcon } from './icons';
import type { User, Job } from '../types';

interface AdminDashboardProps {
  users: User[];
  importJobs: Job[];
  exportJobs: Job[];
  onImpersonate: (user: User) => void;
  onToggleUserStatus: (userId: string) => void;
  onRetryJob: (jobId: string) => void;
  onRetryExportJob: (jobId: string) => void;
}

const AdminSection: React.FC<{ title: string; children: React.ReactNode; headerContent?: React.ReactNode; }> = ({ title, children, headerContent }) => (
  <div className="bg-slate-800/50 border border-slate-700 rounded-lg">
    <div className="flex justify-between items-center p-4 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-emerald-400">{title}</h3>
        {headerContent}
    </div>
    <div className="p-4">{children}</div>
  </div>
);

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


export const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, importJobs, exportJobs, onImpersonate, onToggleUserStatus, onRetryJob, onRetryExportJob }) => {
  const [userSearchTerm, setUserSearchTerm] = useState('');
  
  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
    );
  }, [users, userSearchTerm]);

  return (
    <div className="space-y-8">
       <div>
            <h2 className="text-2xl font-bold tracking-tight">管理者ダッシュボード</h2>
            <p className="text-slate-400">アプリケーションの運用状況を確認・管理します。</p>
        </div>

      <AdminSection 
        title="ユーザー管理"
        headerContent={
            <div className="relative w-full max-w-xs">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="メールアドレスで検索..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-md pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
            </div>
        }
      >
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
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-t border-slate-700">
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4"><StatusBadge status={user.status}/></td>
                  <td className="py-3 px-4">{user.plan}</td>
                  <td className="py-3 px-4 space-x-2">
                    <button 
                      onClick={() => onImpersonate(user)}
                      className="text-blue-400 hover:underline text-xs inline-flex items-center gap-1"
                      title={`${user.email} としてログイン`}
                    >
                      <UserIcon className="h-3 w-3" />
                      なりすまし
                    </button>
                    <button onClick={() => onToggleUserStatus(user.id)} className="text-red-400 hover:underline text-xs">
                      {user.status === 'Active' ? '停止' : '再開'}
                    </button>
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
              {importJobs.map(job => (
                <tr key={job.id} className="border-t border-slate-700">
                  <td className="py-3 px-4 font-mono">{job.id}</td>
                  <td className="py-3 px-4"><StatusBadge status={job.status}/></td>
                  <td className="py-3 px-4">{job.submittedAt}</td>
                  <td className="py-3 px-4 truncate max-w-xs">{job.result}</td>
                  <td className="py-3 px-4">
                    {job.status === 'failed' && <button onClick={() => onRetryJob(job.id)} className="text-emerald-400 hover:underline text-xs inline-flex items-center gap-1">
                        <ArrowPathIcon className="h-3 w-3" />
                        Retry
                        </button>}
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
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {exportJobs.map(job => (
                <tr key={job.id} className="border-t border-slate-700">
                  <td className="py-3 px-4 font-mono">{job.id}</td>
                  <td className="py-3 px-4"><StatusBadge status={job.status}/></td>
                  <td className="py-3 px-4">{job.submittedAt}</td>
                  <td className="py-3 px-4 truncate max-w-xs">
                    {job.status === 'completed' ? <a href="#" className="text-emerald-400 hover:underline text-xs">{job.result}</a> : job.result}
                  </td>
                   <td className="py-3 px-4">
                    {job.status === 'failed' && <button onClick={() => onRetryExportJob(job.id)} className="text-emerald-400 hover:underline text-xs inline-flex items-center gap-1">
                        <ArrowPathIcon className="h-3 w-3" />
                        再発行
                        </button>}
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