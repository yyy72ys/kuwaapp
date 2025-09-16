import React, { useState, useEffect, useCallback } from 'react';
import type { Individual, Photo } from '../types';
import { ArrowLeftIcon, BeetleIcon, SparklesIcon } from './icons';
import { generateIndividualReport } from '../services/geminiService';

interface PublicProfileProps {
    individual: Individual;
    onBack: () => void;
}

export const PublicProfile: React.FC<PublicProfileProps> = ({ individual, onBack }) => {
    const [mainPhoto, setMainPhoto] = useState<Photo | null>(null);
    const [aiReport, setAiReport] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState<boolean>(true);

    useEffect(() => {
        const primary = individual.photos.find(p => p.isPrimary) || individual.photos[0] || null;
        setMainPhoto(primary);
    }, [individual.photos]);

    const handleGenerateReport = useCallback(async () => {
        setIsGenerating(true);
        try {
            const report = await generateIndividualReport(individual);
            setAiReport(report);
        } catch (error) {
            setAiReport("紹介文の生成に失敗しました。");
        } finally {
            setIsGenerating(false);
        }
    }, [individual]);

    useEffect(() => {
        handleGenerateReport();
    }, [handleGenerateReport]);

    return (
        // In a real application with routing, you'd use react-helmet or similar
        // to set OGP meta tags in the document head for social media sharing.
        // <meta property="og:title" content={`${individual.speciesCommon} - ${individual.individualCode}`} />
        // <meta property="og:description" content={individual.notes || `A beautiful ${individual.speciesScientific}.`} />
        // <meta property="og:image" content={mainPhoto?.url} />
        <div className="min-h-screen bg-slate-100 text-slate-800">
            <header className="bg-white shadow-sm">
                 <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <BeetleIcon className="h-7 w-7 text-emerald-600" />
                        <span className="text-lg font-bold text-slate-700">BeetleBase Public Profile</span>
                    </div>
                    <button onClick={onBack} className="flex items-center space-x-2 text-sm text-slate-600 hover:text-emerald-700">
                      <ArrowLeftIcon className="h-4 w-4" />
                      <span>管理画面へ戻る</span>
                    </button>
                 </div>
            </header>
            
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        {/* Photo Gallery */}
                        <div className="w-full">
                           <div className="aspect-square bg-slate-200 rounded-lg shadow-lg w-full overflow-hidden mb-2">
                               {mainPhoto ? (
                                   <img src={mainPhoto.url} alt={individual.speciesCommon} className="w-full h-full object-cover" />
                               ) : (
                                   <div className="w-full h-full flex items-center justify-center text-slate-500">No Image</div>
                               )}
                           </div>
                           {individual.photos.length > 1 && (
                               <div className="grid grid-cols-5 gap-2">
                                   {individual.photos.map(photo => (
                                       <button key={photo.id} onClick={() => setMainPhoto(photo)} className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 rounded-lg aspect-square">
                                           <img src={photo.thumbUrl} alt={`Thumbnail ${photo.id}`} className={`w-full h-full object-cover rounded-md border-2 transition-colors ${mainPhoto?.id === photo.id ? 'border-emerald-500' : 'border-slate-300 hover:border-slate-400'}`} />
                                       </button>
                                   ))}
                               </div>
                           )}
                        </div>

                        {/* Info Section */}
                        <div className="w-full">
                           <h1 className="text-3xl font-bold tracking-tight text-slate-900">{individual.speciesCommon}</h1>
                           <p className="text-lg text-slate-600 italic">{individual.speciesScientific}</p>
                           <p className="text-md font-mono mt-1 text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md inline-block">{individual.individualCode}</p>
                           
                           <div className="mt-6 border-t border-slate-200 pt-6">
                               <h2 className="text-xl font-semibold flex items-center gap-2">
                                   <SparklesIcon className="h-6 w-6 text-indigo-500"/>
                                   AIによる紹介文
                               </h2>
                               {isGenerating ? (
                                   <div className="mt-2 p-4 rounded-md bg-slate-200 animate-pulse">
                                       <div className="h-4 bg-slate-300 rounded w-3/4 mb-2.5"></div>
                                       <div className="h-4 bg-slate-300 rounded w-full mb-2.5"></div>
                                       <div className="h-4 bg-slate-300 rounded w-1/2"></div>
                                   </div>
                               ) : (
                                   <p className="mt-2 text-slate-700 whitespace-pre-wrap">{aiReport}</p>
                               )}
                           </div>

                           <div className="mt-6 border-t border-slate-200 pt-6">
                                <h3 className="font-semibold mb-2">ブリーダーのメモ</h3>
                                <p className="text-slate-600 bg-slate-200 p-3 rounded-md">{individual.notes || '特記事項なし'}</p>
                           </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};