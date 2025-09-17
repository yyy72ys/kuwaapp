
import React from 'react';
import type { Individual } from '../types';
import { MaleIcon, FemaleIcon, DnaIcon } from './icons';

interface PedigreeTreeProps {
  individual: Individual;
}

const Node: React.FC<{ code?: string; sex?: 'M' | 'F' }> = ({ code, sex }) => (
  <div className="flex items-center space-x-2 bg-slate-700 border border-slate-600 rounded-md px-3 py-1.5 min-w-[120px]">
    {sex === 'M' && <MaleIcon className="h-4 w-4 text-blue-400" />}
    {sex === 'F' && <FemaleIcon className="h-4 w-4 text-pink-400" />}
    <span className="text-sm font-mono">{code || 'Unknown'}</span>
  </div>
);

export const PedigreeTree: React.FC<PedigreeTreeProps> = ({ individual }) => {
  return (
    <div className="flex justify-center items-center h-full">
      <div className="flex items-center space-x-8">
        {/* Parents */}
        <div className="flex flex-col space-y-8">
            <Node code={individual.parentCodeM} sex="M" />
            <Node code={individual.parentCodeF} sex="F" />
        </div>
        {/* Connecting Lines */}
        <div className="relative h-24 w-8">
            <div className="absolute top-1/2 left-0 w-full border-t-2 border-slate-500"></div>
            <div className="absolute top-1/2 left-0 h-full w-px">
                <div className="absolute top-[-48px] h-[48px] border-l-2 border-slate-500"></div>
                <div className="absolute bottom-[-48px] h-[48px] border-l-2 border-slate-500"></div>
            </div>
        </div>
         {/* Individual */}
        <div className="flex items-center space-x-2 bg-emerald-800 border border-emerald-600 rounded-md px-4 py-2">
            <DnaIcon className="h-5 w-5 text-emerald-300" />
            <span className="text-md font-bold font-mono">{individual.individualCode}</span>
        </div>
      </div>
    </div>
  );
};
