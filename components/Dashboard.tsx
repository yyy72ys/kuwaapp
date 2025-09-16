import React, { useState, useMemo, useCallback } from 'react';
import type { Individual } from '../types';
import { IndividualCard } from './IndividualCard';
import { IndividualTable } from './IndividualTable';
import { SearchIcon, TableCellsIcon, Squares2x2Icon, PlusIcon, ArrowUpCircleIcon } from './icons';

interface DashboardProps {
  individuals: Individual[];
  onSelectIndividual: (individual: Individual) => void;
  userPlan: 'free' | 'pro';
  onUpgradeClick: () => void;
}

type ViewMode = 'card' | 'table';
type SortDirection = 'ascending' | 'descending';
interface SortConfig {
  key: keyof Individual | 'latestWeightG' | null;
  direction: SortDirection;
}

const PLAN_LIMITS = {
    free: 5,
    pro: Infinity,
}

export const Dashboard: React.FC<DashboardProps> = ({ individuals, onSelectIndividual, userPlan, onUpgradeClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'individualCode', direction: 'ascending' });

  const atLimit = userPlan === 'free' && individuals.length >= PLAN_LIMITS.free;

  const filteredIndividuals = useMemo(() => {
    return individuals.filter(ind => 
      ind.individualCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.speciesCommon.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ind.lineName && ind.lineName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [individuals, searchTerm]);

  const sortedIndividuals = useMemo(() => {
    let sortableItems = [...filteredIndividuals];
    if (sortConfig.key !== null) {
      const getLatestWeightValue = (individual: Individual): number => {
        if (!individual.measurements || individual.measurements.length === 0) return -1;
        const sortedMeasurements = [...individual.measurements].sort((a, b) => 
            new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime()
        );
        return sortedMeasurements[0]?.weightG ?? -1;
      };

      sortableItems.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (sortConfig.key === 'latestWeightG') {
            aValue = getLatestWeightValue(a);
            bValue = getLatestWeightValue(b);
        } else {
            aValue = a[sortConfig.key as keyof Individual];
            bValue = b[sortConfig.key as keyof Individual];
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredIndividuals, sortConfig]);

  const requestSort = useCallback((key: keyof Individual | 'latestWeightG') => {
    let direction: SortDirection = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">個体一覧</h2>
            <p className="text-slate-400">管理している全ての個体が表示されます。</p>
        </div>
        <div className="flex items-center gap-2">
            <button 
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none bg-slate-700 text-white hover:bg-slate-600 h-9 px-4 py-2 gap-2"
                disabled={atLimit}
                onClick={() => atLimit ? onUpgradeClick() : alert('新規個体登録フォームを開きます（UI未実装）')}
                title={atLimit ? '上限に達しました' : '新規個体を登録'}
            >
                <PlusIcon className="h-4 w-4" />
                新規登録
            </button>
            <div className="flex items-center justify-between sm:justify-end gap-2 bg-slate-800 p-1 rounded-lg">
                <button onClick={() => setViewMode('card')} className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-colors ${viewMode === 'card' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                    <Squares2x2Icon className="h-5 w-5"/> カード
                </button>
                <button onClick={() => setViewMode('table')} className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-colors ${viewMode === 'table' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                    <TableCellsIcon className="h-5 w-5"/> テーブル
                </button>
            </div>
        </div>
      </div>
      
       {atLimit && (
        <div className="bg-amber-900/50 border border-amber-700 text-amber-300 text-sm rounded-lg p-4 flex items-center justify-between">
            <p>
                <span className="font-bold">フリープランの上限に達しました。</span>
                個体登録数を無制限にするには、Proプランにアップグレードしてください。
            </p>
            <button onClick={onUpgradeClick} className="inline-flex items-center gap-2 bg-amber-500 text-amber-950 font-bold px-4 py-2 rounded-md hover:bg-amber-400 whitespace-nowrap">
                <ArrowUpCircleIcon className="h-5 w-5" />
                アップグレード
            </button>
        </div>
       )}

      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="コード, 種名, 血統名で検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-md pl-10 pr-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
      </div>

      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedIndividuals.map(individual => (
            <IndividualCard 
              key={individual.id} 
              individual={individual} 
              onSelect={() => onSelectIndividual(individual)}
            />
          ))}
        </div>
      ) : (
        <IndividualTable 
            individuals={sortedIndividuals}
            onSelectIndividual={onSelectIndividual}
            requestSort={requestSort}
            sortConfig={sortConfig}
        />
      )}
    </div>
  );
};