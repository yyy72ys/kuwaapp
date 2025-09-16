import { useState } from 'react';
import type { Individual, Photo } from '../types';
import { Stage, Sex } from '../types';

const initialIndividuals: Individual[] = [
  {
    id: '1',
    individualCode: 'DHO-2024-001',
    speciesCommon: '国産オオクワガタ',
    speciesScientific: 'Dorcus hopei binodulosus',
    stage: Stage.ADULT,
    sex: Sex.MALE,
    birthDate: '2023-07-15',
    introducedDate: '2024-01-10',
    lineName: 'YG-Bloodline',
    parentCodeM: 'YG-2022-A',
    parentCodeF: 'YG-2022-B',
    notes: '羽化後、非常に元気。ゼリー食も旺盛。種親として期待。',
    publicProfileUrl: '/u/dho-2024-001',
    photos: [
      { id: 'p1-1', url: 'https://picsum.photos/seed/dho001/600/400', thumbUrl: 'https://picsum.photos/seed/dho001/300/200', createdAt: '2024-05-20T10:00:00Z', isPrimary: true },
      { id: 'p1-2', url: 'https://picsum.photos/seed/dho001-2/600/400', thumbUrl: 'https://picsum.photos/seed/dho001-2/300/200', createdAt: '2024-05-21T11:30:00Z', isPrimary: false },
      { id: 'p1-3', url: 'https://picsum.photos/seed/dho001-3/600/400', thumbUrl: 'https://picsum.photos/seed/dho001-3/300/200', createdAt: '2024-05-22T11:30:00Z', isPrimary: false },

    ],
    measurements: [
      { id: 'm1-1', measuredAt: '2023-11-01T09:00:00Z', weightG: 32.5 },
      { id: 'm1-2', measuredAt: '2024-02-01T09:00:00Z', weightG: 34.1 },
      { id: 'm1-3', measuredAt: '2024-05-15T09:00:00Z', weightG: 31.8, lengthMm: 85.2, jawWidthMm: 6.8 },
    ],
  },
  {
    id: '2',
    individualCode: 'PMI-2025-002',
    speciesCommon: 'ミヤマクワガタ',
    speciesScientific: 'Lucanus maculifemoratus',
    stage: Stage.LARVA,
    sex: Sex.UNKNOWN,
    birthDate: '2024-08-01',
    introducedDate: '2024-09-01',
    lineName: 'Fuji-Line',
    notes: '現在2令幼虫。菌糸ビンで管理中。',
    photos: [
      { id: 'p2-1', url: 'https://picsum.photos/seed/pmi002/600/400', thumbUrl: 'https://picsum.photos/seed/pmi002/300/200', createdAt: '2024-09-01T14:00:00Z', isPrimary: true },
    ],
    measurements: [
      { id: 'm2-1', measuredAt: '2024-09-01T14:00:00Z', weightG: 3.5 },
      { id: 'm2-2', measuredAt: '2024-12-01T10:00:00Z', weightG: 15.2 },
      { id: 'm2-3', measuredAt: '2025-03-01T10:00:00Z', weightG: 22.8 },
    ],
  },
   {
    id: '3',
    individualCode: 'GME-2023-003',
    speciesCommon: 'ギラファノコギリクワガタ',
    speciesScientific: 'Prosopocoilus giraffa',
    stage: Stage.PUPA,
    sex: Sex.MALE,
    introducedDate: '2023-12-01',
    lineName: 'Keisuke-G',
    parentCodeM: 'GME-K-01',
    parentCodeF: 'GME-K-02',
    notes: '蛹室形成確認。無事羽化を待つのみ。',
    photos: [
        { id: 'p3-1', url: 'https://picsum.photos/seed/gme003/600/400', thumbUrl: 'https://picsum.photos/seed/gme003/300/200', createdAt: '2024-04-10T18:00:00Z', isPrimary: true },
    ],
    measurements: [
        { id: 'm3-1', measuredAt: '2024-03-15T12:00:00Z', weightG: 45.1 },
    ],
  },
];

export const useMockData = () => {
  const [individuals, setIndividuals] = useState<Individual[]>(initialIndividuals);
  const [userPlan, setUserPlan] = useState<'free' | 'pro'>('free');

  const addIndividual = (individual: Omit<Individual, 'id' | 'photos' | 'measurements'>) => {
    const newIndividual: Individual = {
      ...individual,
      id: new Date().toISOString(),
      photos: [],
      measurements: [],
    };
    setIndividuals(prev => [...prev, newIndividual]);
  };
  
  const updateIndividual = (updatedIndividual: Individual) => {
    setIndividuals(prev => 
      prev.map(ind => (ind.id === updatedIndividual.id ? updatedIndividual : ind))
    );
  };

  const addPhotoToIndividual = (individualId: string, photoUrl: string) => {
    setIndividuals(prev => 
        prev.map(ind => {
            if (ind.id === individualId) {
                const newPhoto: Photo = {
                    id: `p${ind.id}-${ind.photos.length + 1}-${Date.now()}`,
                    url: photoUrl,
                    thumbUrl: photoUrl.replace('/600/400', '/300/200'),
                    createdAt: new Date().toISOString(),
                    isPrimary: ind.photos.length === 0, // Make first photo primary
                };
                return { ...ind, photos: [...ind.photos, newPhoto] };
            }
            return ind;
        })
    );
  };

  const upgradePlan = () => {
    setUserPlan('pro');
  };

  return { individuals, addIndividual, updateIndividual, addPhotoToIndividual, userPlan, upgradePlan };
};