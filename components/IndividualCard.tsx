import React from 'react';
import type { Individual } from '../types';
import { Stage, Sex } from '../types';
import { MaleIcon, FemaleIcon, DnaIcon } from './icons';

interface IndividualCardProps {
  individual: Individual;
  onSelect: () => void;
}

const stageColors: Record<Stage, string> = {
  [Stage.EGG]: 'bg-gray-500 text-white',
  [Stage.LARVA]: 'bg-yellow-600 text-white',
  [Stage.PUPA]: 'bg-purple-600 text-white',
  [Stage.ADULT]: 'bg-red-600 text-white',
  [Stage.UNKNOWN]: 'bg-gray-400 text-black',
};

const SexDisplay: React.FC<{ sex: Sex }> = ({ sex }) => {
  switch (sex) {
    case Sex.MALE:
      return <MaleIcon className="h-4 w-4 text-blue-400" />;
    case Sex.FEMALE:
      return <FemaleIcon className="h-4 w-4 text-pink-400" />;
    default:
      return null;
  }
};

export const IndividualCard: React.FC<IndividualCardProps> = ({ individual, onSelect }) => {
  const primaryPhoto = individual.photos.find(p => p.isPrimary) || individual.photos[0];

  return (
    <div 
      onClick={onSelect}
      className="bg-slate-800 rounded-lg overflow-hidden shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 cursor-pointer group border border-slate-700 hover:border-emerald-500"
    >
      <div className="aspect-w-16 aspect-h-9 w-full overflow-hidden">
        {primaryPhoto ? (
          <img src={primaryPhoto.thumbUrl} alt={individual.speciesCommon} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-48 bg-slate-700 flex items-center justify-center">
            <span className="text-slate-500">No Image</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
            <p className="text-sm font-bold text-emerald-400">{individual.individualCode}</p>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${stageColors[individual.stage]}`}>
                {individual.stage.toUpperCase()}
            </span>
        </div>
        <h3 className="text-lg font-semibold mt-1 truncate text-slate-100">{individual.speciesCommon}</h3>
        <p className="text-sm text-slate-400 italic truncate">{individual.speciesScientific}</p>
        {individual.lineName && (
          <div className="flex items-center space-x-2 mt-2 text-sm text-slate-300">
            <DnaIcon className="h-4 w-4 text-slate-400" />
            <span>{individual.lineName}</span>
            <SexDisplay sex={individual.sex} />
          </div>
        )}
      </div>
    </div>
  );
};