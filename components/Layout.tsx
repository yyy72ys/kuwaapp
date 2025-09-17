import React from 'react';
import { BeetleIcon, UploadIcon, ShieldCheckIcon, ArrowLeftOnRectangleIcon, ArrowUturnLeftIcon } from './icons';

interface LayoutProps {
  children: React.ReactNode;
  onImportClick: () => void;
  onNavigate: (view: 'user' | 'admin') => void;
  currentView: 'user' | 'admin';
  impersonatingUser: { email: string } | null;
  onStopImpersonating: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onImportClick, onNavigate, currentView, impersonatingUser, onStopImpersonating }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col">
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <BeetleIcon className="h-8 w-8 text-emerald-400" />
              <h1 className="text-xl font-bold tracking-tight text-slate-100">
                BeetleBase
              </h1>
               {currentView === 'admin' && !impersonatingUser && (
                <span className="text-sm font-semibold text-amber-400 bg-amber-900/50 px-2 py-1 rounded-md">
                    Admin Panel
                </span>
               )}
            </div>
            <div className="flex items-center gap-2">
                <button
                onClick={onImportClick}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none bg-emerald-600 text-white hover:bg-emerald-700 h-9 px-4 py-2 gap-2"
                >
                <UploadIcon className="h-4 w-4" />
                CSVインポート
                </button>

                {!impersonatingUser && (
                  <>
                    {currentView === 'user' ? (
                        <button
                            onClick={() => onNavigate('admin')}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none bg-slate-700 text-white hover:bg-slate-600 h-9 px-4 py-2 gap-2"
                            title="管理者パネルへ移動"
                        >
                            <ShieldCheckIcon className="h-4 w-4" />
                            管理者
                        </button>
                    ) : (
                        <button
                            onClick={() => onNavigate('user')}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none bg-slate-700 text-white hover:bg-slate-600 h-9 px-4 py-2 gap-2"
                            title="アプリへ戻る"
                        >
                            <ArrowLeftOnRectangleIcon className="h-4 w-4" />
                            アプリへ戻る
                        </button>
                    )}
                  </>
                )}
            </div>
          </div>
        </div>
        {impersonatingUser && (
            <div className="bg-blue-900/50 border-t border-blue-700">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-center text-sm">
                    <p className="text-blue-300">
                        現在 <span className="font-bold">{impersonatingUser.email}</span> として操作中です。
                    </p>
                    <button 
                        onClick={onStopImpersonating}
                        className="ml-4 inline-flex items-center gap-2 text-blue-200 hover:text-white bg-blue-800/50 hover:bg-blue-700 px-3 py-1 rounded-md transition-colors"
                    >
                        <ArrowUturnLeftIcon className="h-4 w-4" />
                        管理者に戻る
                    </button>
                </div>
            </div>
        )}
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        {children}
      </main>
    </div>
  );
};