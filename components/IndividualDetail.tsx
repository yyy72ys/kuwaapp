import React, { useState, useCallback, useEffect } from 'react';
import type { Individual, Photo } from '../types';
import { ArrowLeftIcon, SparklesIcon, DocumentTextIcon, PlusIcon, QrCodeIcon, CheckIcon, ClockIcon, ExternalLinkIcon, ArrowUpCircleIcon, DownloadIcon, XIcon, CheckCircleIcon, DocumentDuplicateIcon } from './icons';
import { MeasurementChart } from './MeasurementChart';
import { PedigreeTree } from './PedigreeTree';
import { generateIndividualReport } from '../services/geminiService';
import { PhotoUploadModal } from './PhotoUploadModal';
import { stageTranslations, sexTranslations } from '../utils/translations';

type JobStatus = 'idle' | 'processing' | 'success';
type JobState = { status: JobStatus; url: string | null; fileName: string | null };

interface IndividualDetailProps {
  individual: Individual;
  onBack: () => void;
  onAddPhoto: (photoUrl: string) => void;
  onViewPublicProfile: (individual: Individual) => void;
  userPlan: 'free' | 'pro';
  onUpgradeClick: () => void;
  onCopyToNew: (individual: Individual) => void;
  atLimit: boolean;
}

const DetailSection: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={`bg-slate-800/50 border border-slate-700 rounded-lg p-6 ${className}`}>
    <h3 className="text-lg font-semibold text-emerald-400 mb-4">{title}</h3>
    {children}
  </div>
);

const PHOTO_LIMITS = {
    free: 10,
    pro: 50,
};

export const IndividualDetail: React.FC<IndividualDetailProps> = ({ individual, onBack, onAddPhoto, onViewPublicProfile, userPlan, onUpgradeClick, onCopyToNew, atLimit }) => {
  const [aiReport, setAiReport] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [pedigreeJob, setPedigreeJob] = useState<JobState>({ status: 'idle', url: null, fileName: null });
  const [labelJob, setLabelJob] = useState<JobState>({ status: 'idle', url: null, fileName: null });

  const atPhotoLimit = userPlan === 'free' && individual.photos.length >= PHOTO_LIMITS.free;

  const getInitialPhoto = useCallback(() => {
    return individual.photos.find(p => p.isPrimary) || individual.photos[0] || null;
  }, [individual.photos]);

  const [mainPhoto, setMainPhoto] = useState<Photo | null>(getInitialPhoto());
  
  useEffect(() => {
    setMainPhoto(getInitialPhoto());
  }, [individual, getInitialPhoto]);

  const handleGenerateReport = useCallback(async () => {
    setIsGenerating(true);
    setAiReport('');
    try {
      const report = await generateIndividualReport(individual);
      setAiReport(report);
    } catch (error) {
      setAiReport("レポートの生成に失敗しました。");
    } finally {
      setIsGenerating(false);
    }
  }, [individual]);

  const handlePhotoAdded = (photoUrl: string) => {
    onAddPhoto(photoUrl);
    setUploadModalOpen(false);
  };

  const simulateJob = (
    setter: React.Dispatch<React.SetStateAction<JobState>>,
    downloadUrl: string,
    fileName: string
  ) => {
    setter({ status: 'processing', url: null, fileName: null });
    setTimeout(() => {
      setter({ status: 'success', url: downloadUrl, fileName: fileName });
    }, 2000);
  };

  const handlePedigreeJob = () => {
    simulateJob(setPedigreeJob, '#', `pedigree_${individual.individualCode}.pdf`);
  };

  const handleLabelJob = () => {
    simulateJob(setLabelJob, '#', `qr_label_${individual.individualCode}.pdf`);
  };

  const JobButton: React.FC<{
    status: JobStatus;
    onIdle: () => void;
    idleText: string;
    processingText: string;
    successText: string;
    icon: React.ReactNode;
    className: string;
  }> = ({ status, onIdle, idleText, processingText, successText, icon, className }) => (
    <button 
        onClick={onIdle} 
        disabled={status !== 'idle'}
        className={`inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-70 disabled:pointer-events-none h-10 px-4 py-2 ${className}`}
    >
        {status === 'idle' && <>{icon} {idleText}</>}
        {status === 'processing' && <><ClockIcon className="h-5 w-5 animate-spin"/> {processingText}</>}
        {status === 'success' && <><CheckIcon className="h-5 w-5"/> {successText}</>}
    </button>
  );

  return (
    <div className="space-y-8">
      <div>
        <button onClick={onBack} className="flex items-center space-x-2 text-sm text-slate-300 hover:text-emerald-400 mb-4">
          <ArrowLeftIcon className="h-4 w-4" />
          <span>一覧へ戻る</span>
        </button>
        <div className="flex flex-col md:flex-row gap-8 items-start">
           <div className="w-full md:w-1/3">
             {atPhotoLimit && (
                <div className="bg-amber-900/50 border border-amber-700 text-amber-300 text-sm rounded-lg p-3 mb-4 flex items-center gap-3">
                    <ArrowUpCircleIcon className="h-8 w-8 flex-shrink-0" />
                    <div>
                        <span className="font-bold">写真登録数が上限です。</span>
                        <p>Proプランにアップグレードして、最大{PHOTO_LIMITS.pro}枚の写真を登録しましょう。</p>
                    </div>
                </div>
            )}
             <div className="aspect-square bg-slate-800 rounded-lg shadow-lg w-full overflow-hidden">
                {mainPhoto ? (
                    <img src={mainPhoto.url} alt={individual.speciesCommon} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">No Image</div>
                )}
             </div>
             {individual.photos.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mt-2">
                    {individual.photos.map(photo => (
                        <button 
                            key={photo.id} 
                            onClick={() => setMainPhoto(photo)} 
                            className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-emerald-500 rounded-lg aspect-square"
                            aria-label={`View photo ${photo.id}`}
                        >
                            <img 
                                src={photo.thumbUrl}
                                alt={`Thumbnail ${photo.id}`}
                                className={`w-full h-full object-cover rounded-md border-2 transition-colors ${mainPhoto?.id === photo.id ? 'border-emerald-500' : 'border-slate-700 hover:border-slate-500'}`}
                            />
                        </button>
                    ))}
                </div>
             )}
           </div>
           <div className="w-full md:w-2/3">
             <h2 className="text-3xl font-bold tracking-tight">{individual.individualCode}</h2>
             <p className="text-xl text-slate-300">{individual.speciesCommon}</p>
             <p className="text-md text-slate-400 italic">{individual.speciesScientific}</p>
             <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="font-semibold text-slate-400">ステージ: <span className="font-normal text-slate-200">{stageTranslations[individual.stage]}</span></div>
                <div className="font-semibold text-slate-400">性別: <span className="font-normal text-slate-200">{sexTranslations[individual.sex]}</span></div>
                <div className="font-semibold text-slate-400">血統: <span className="font-normal text-slate-200">{individual.lineName || 'N/A'}</span></div>
                <div className="font-semibold text-slate-400">羽化日: <span className="font-normal text-slate-200">{individual.birthDate || 'N/A'}</span></div>
                <div className="font-semibold text-slate-400">管理開始日: <span className="font-normal text-slate-200">{individual.introducedDate}</span></div>
             </div>
             <p className="mt-4 text-slate-300 bg-slate-800 p-3 rounded-md border border-slate-700">{individual.notes || '特記事項なし'}</p>
             <div className="mt-4 flex flex-wrap gap-2">
                <button
                    onClick={() => atPhotoLimit ? onUpgradeClick() : setUploadModalOpen(true)}
                    disabled={userPlan === 'pro' && individual.photos.length >= PHOTO_LIMITS.pro}
                    title={atPhotoLimit ? `フリープランの上限 (${PHOTO_LIMITS.free}枚) に達しました。` : '写真を追加'}
                    className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none h-9 px-4 py-2 gap-2 ${atPhotoLimit ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                >
                    <PlusIcon className="h-4 w-4" />
                    {atPhotoLimit ? 'アップグレード' : '写真を追加'}
                </button>
                <button
                    onClick={() => atLimit ? onUpgradeClick() : onCopyToNew(individual)}
                    title={atLimit ? 'フリープランの上限に達しました。' : 'このデータを元に新規作成'}
                    className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none h-9 px-4 py-2 gap-2 ${atLimit ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                >
                    <DocumentDuplicateIcon className="h-4 w-4" />
                     {atLimit ? 'アップグレード' : 'コピーして新規作成'}
                </button>
                 <button
                    onClick={() => onViewPublicProfile(individual)}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none bg-slate-700 text-white hover:bg-slate-600 h-9 px-4 py-2 gap-2"
                >
                    <ExternalLinkIcon className="h-4 w-4" />
                    公開プロフィールを表示
                </button>
             </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DetailSection title="成長記録">
          <MeasurementChart measurements={individual.measurements} />
        </DetailSection>

        <DetailSection title="血統図">
          <PedigreeTree individual={individual} />
        </DetailSection>
        
        <div className="lg:col-span-2">
            <DetailSection title="AIブリーダーレポート & 各種出力">
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                        <button 
                            onClick={handleGenerateReport} 
                            disabled={isGenerating}
                            className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none bg-indigo-600 text-white hover:bg-indigo-700 h-10 px-4 py-2"
                        >
                            <SparklesIcon className="h-5 w-5"/>
                            {isGenerating ? 'レポート生成中...' : 'AIレポートを生成'}
                        </button>
                        <JobButton 
                            status={pedigreeJob.status}
                            onIdle={handlePedigreeJob}
                            idleText="血統書PDFを出力"
                            processingText="PDF生成中..."
                            successText="生成完了"
                            icon={<DocumentTextIcon className="h-5 w-5" />}
                            className="bg-slate-700 text-white hover:bg-slate-600"
                        />
                        <JobButton 
                            status={labelJob.status}
                            onIdle={handleLabelJob}
                            idleText="QRラベルを生成"
                            processingText="ラベル生成中..."
                            successText="生成完了"
                            icon={<QrCodeIcon className="h-5 w-5" />}
                            className="bg-slate-700 text-white hover:bg-slate-600"
                        />
                    </div>

                    {pedigreeJob.status === 'success' && pedigreeJob.url && (
                        <div className="flex items-center gap-3 p-3 bg-slate-700/80 rounded-lg text-sm transition-all">
                            <CheckCircleIcon className="h-6 w-6 text-emerald-400 flex-shrink-0" />
                            <div className="flex-grow">
                            <p className="font-semibold text-slate-100">血統書の準備ができました</p>
                            <a 
                                href={pedigreeJob.url} 
                                download={pedigreeJob.fileName!}
                                onClick={() => setTimeout(() => setPedigreeJob({ status: 'idle', url: null, fileName: null }), 200)}
                                className="text-emerald-400 hover:underline inline-flex items-center gap-1"
                            >
                                <DownloadIcon className="h-4 w-4" />
                                ダウンロード
                            </a>
                            </div>
                            <button onClick={() => setPedigreeJob({ status: 'idle', url: null, fileName: null })} className="p-1 rounded-full hover:bg-slate-600 self-start" aria-label="Dismiss">
                                <XIcon className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    {labelJob.status === 'success' && labelJob.url && (
                        <div className="flex items-center gap-3 p-3 bg-slate-700/80 rounded-lg text-sm transition-all">
                            <CheckCircleIcon className="h-6 w-6 text-emerald-400 flex-shrink-0" />
                            <div className="flex-grow">
                            <p className="font-semibold text-slate-100">QRラベルの準備ができました</p>
                            <a 
                                href={labelJob.url} 
                                download={labelJob.fileName!}
                                onClick={() => setTimeout(() => setLabelJob({ status: 'idle', url: null, fileName: null }), 200)}
                                className="text-emerald-400 hover:underline inline-flex items-center gap-1"
                            >
                                <DownloadIcon className="h-4 w-4" />
                                ダウンロード
                            </a>
                            </div>
                            <button onClick={() => setLabelJob({ status: 'idle', url: null, fileName: null })} className="p-1 rounded-full hover:bg-slate-600 self-start" aria-label="Dismiss">
                                <XIcon className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    {isGenerating && (
                        <div className="mt-4 p-4 rounded-md bg-slate-700/50 border border-slate-600 animate-pulse">
                            <div className="h-4 bg-slate-600 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-slate-600 rounded w-1/2"></div>
                        </div>
                    )}
                    {aiReport && (
                        <div className="mt-4 p-4 rounded-md bg-slate-700/50 border border-slate-600 prose prose-invert prose-sm max-w-none whitespace-pre-wrap">
                            {aiReport}
                        </div>
                    )}
                </div>
            </DetailSection>
        </div>
      </div>
      {isUploadModalOpen && (
        <PhotoUploadModal 
            onClose={() => setUploadModalOpen(false)} 
            onUpload={handlePhotoAdded}
            individualCode={individual.individualCode}
        />
      )}
    </div>
  );
};