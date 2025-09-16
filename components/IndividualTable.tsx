import React from 'react';
import type { Individual } from '../types';
import { Sex } from '../types';
import { MaleIcon, FemaleIcon, ChevronUpDownIcon } from './icons';

type SortDirection = 'ascending' | 'descending';
interface SortConfig {
  key: keyof Individual | 'latestWeightG' | null;
  direction: SortDirection;
}

interface IndividualTableProps {
  individuals: Individual[];
  onSelectIndividual: (individual: Individual) => void;
  requestSort: (key: keyof Individual | 'latestWeightG') => void;
  sortConfig: SortConfig;
}

const SortableHeader: React.FC<{
    sortKey: keyof Individual | 'latestWeightG';
    title: string;
    requestSort: (key: keyof Individual | 'latestWeightG') => void;
    sortConfig: SortConfig;
    className?: string;
}> = ({ sortKey, title, requestSort, sortConfig, className }) => {
    const isSorted = sortConfig.key === sortKey;
    const directionIcon = isSorted ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : <ChevronUpDownIcon className="h-4 w-4" />;

    return (
        <th className={`px-4 py-3 ${className || ''}`}>
            <button
                type="button"
                onClick={() => requestSort(sortKey)}
                className="flex items-center gap-2 group"
            >
                {title}
                <span className={`transition-opacity ${isSorted ? 'opacity-100 text-emerald-400' : 'opacity-30 group-hover:opacity-100'}`}>
                    {directionIcon}
                </span>
            </button>
        </th>
    );
};

export const IndividualTable: React.FC<IndividualTableProps> = ({
  individuals,
  onSelectIndividual,
  requestSort,
  sortConfig,
}) => {

  const getLatestWeight = (individual: Individual) => {
    if (!individual.measurements || individual.measurements.length === 0) return 'N/A';
    
    const sortedMeasurements = [...individual.measurements].sort((a, b) => 
      new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime()
    );
    
    const latest = sortedMeasurements[0];
    return latest.weightG ? `${latest.weightG}g` : 'N/A';
  };

  return (
    <div className="overflow-x-auto bg-slate-800 border border-slate-700 rounded-lg">
      <table className="w-full text-sm text-left text-slate-300">
        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 border-b border-slate-700">
          <tr>
            <SortableHeader sortKey="individualCode" title="コード" requestSort={requestSort} sortConfig={sortConfig} />
            <SortableHeader sortKey="speciesCommon" title="種名" requestSort={requestSort} sortConfig={sortConfig} />
            <SortableHeader sortKey="lineName" title="血統" requestSort={requestSort} sortConfig={sortConfig} />
            <SortableHeader sortKey="stage" title="ステージ" requestSort={requestSort} sortConfig={sortConfig} />
            <th className="px-4 py-3">性別</th>
            <SortableHeader sortKey="latestWeightG" title="最新体重" requestSort={requestSort} sortConfig={sortConfig} />
            <SortableHeader sortKey="introducedDate" title="管理開始日" requestSort={requestSort} sortConfig={sortConfig} />
          </tr>
        </thead>
        <tbody>
          {individuals.map((individual) => (
            <tr
              key={individual.id}
              onClick={() => onSelectIndividual(individual)}
              className="border-b border-slate-700 hover:bg-slate-700/50 cursor-pointer transition-colors"
            >
              <td className="px-4 py-3 font-mono font-medium text-emerald-400 whitespace-nowrap">
                {individual.individualCode}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{individual.speciesCommon}</td>
              <td className="px-4 py-3 text-slate-400">{individual.lineName || 'N/A'}</td>
              <td className="px-4 py-3 capitalize">{individual.stage}</td>
              <td className="px-4 py-3">
                {/* FIX: Wrap icons in a span with a title attribute to provide a tooltip, as the Icon components were not accepting the title prop. */}
                {individual.sex === Sex.MALE && (
                  <span title="Male">
                    <MaleIcon className="h-5 w-5 text-blue-400" />
                  </span>
                )}
                {individual.sex === Sex.FEMALE && (
                  <span title="Female">
                    <FemaleIcon className="h-5 w-5 text-pink-400" />
                  </span>
                )}
              </td>
              <td className="px-4 py-3">{getLatestWeight(individual)}</td>
              <td className="px-4 py-3 whitespace-nowrap">{individual.introducedDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};