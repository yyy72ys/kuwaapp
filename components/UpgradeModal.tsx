import React, { useState } from 'react';
import { XIcon, CheckCircleIcon, SparklesIcon } from './icons';

interface UpgradeModalProps {
  onClose: () => void;
  onUpgrade: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ onClose, onUpgrade }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgradeClick = () => {
    setIsProcessing(true);
    // Simulate API call to create Stripe Checkout session
    setTimeout(() => {
        // In a real app, this would redirect to Stripe.
        // Here, we'll just complete the upgrade.
        onUpgrade();
        setIsProcessing(false);
    }, 1500);
  };
  
  const proFeatures = [
    "登録個体数の上限なし",
    "高度な血統管理機能",
    "詳細なデータ分析",
    "優先的なサポート",
    "広告の非表示",
  ];

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-full max-w-md relative">
        <div className="p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-500">
                <SparklesIcon className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold mt-4">Proプランにアップグレード</h2>
            <p className="text-slate-400 mt-2">
                BeetleBaseの全機能を開放し、あなたのブリーディングを次のレベルへ。
            </p>
        </div>

        <div className="px-6 pb-6 space-y-3">
            <ul className="space-y-2 text-slate-300">
                {proFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start">
                        <CheckCircleIcon className="h-5 w-5 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
        </div>
        
        <div className="p-6 bg-slate-900/50 rounded-b-lg">
          <button 
            onClick={handleUpgradeClick} 
            disabled={isProcessing}
            className="w-full px-4 py-3 text-md font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:bg-emerald-800 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? '処理中...' : 'アップグレード実行 (¥980/月)'}
          </button>
           <button onClick={onClose} className="w-full mt-2 px-4 py-2 text-sm font-medium text-slate-400 rounded-md hover:text-slate-200">
            今はやめておく
          </button>
        </div>
        
        <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-slate-700">
          <XIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};