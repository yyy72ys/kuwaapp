
import React, { useState, useCallback } from 'react';
import { XIcon, UploadIcon, CameraIcon, QrCodeIcon, CheckCircleIcon } from './icons';

interface PhotoUploadModalProps {
  onClose: () => void;
  onUpload: (photoUrl: string) => void;
  individualCode: string;
}

type Mode = 'qr' | 'manual';
type QrStep = 'scan' | 'capture' | 'preview';

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({ onClose, onUpload, individualCode }) => {
  const [mode, setMode] = useState<Mode>('qr');
  const [qrStep, setQrStep] = useState<QrStep>('scan');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleScan = useCallback(() => {
    setIsProcessing(true);
    setMessage(`個体コード「${individualCode}」をスキャン中...`);
    setTimeout(() => {
      setMessage(`コード「${individualCode}」を認識しました。撮影してください。`);
      setQrStep('capture');
      setIsProcessing(false);
    }, 1500);
  }, [individualCode]);

  const handleCapture = useCallback(() => {
    setIsProcessing(true);
    // Simulate taking a picture
    const randomSeed = Math.floor(Math.random() * 1000);
    const newImageUrl = `https://picsum.photos/seed/${individualCode}-${randomSeed}/600/400`;
    setImageSrc(newImageUrl);
    setQrStep('preview');
    setIsProcessing(false);
  }, [individualCode]);

  const handleManualFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = useCallback(() => {
    if (!imageSrc) return;
    setIsProcessing(true);
    // Simulate upload delay
    setTimeout(() => {
        onUpload(imageSrc);
        setIsProcessing(false);
    }, 1000);
  }, [imageSrc, onUpload]);

  const resetQrFlow = () => {
    setQrStep('scan');
    setImageSrc(null);
    setMessage('');
  };
  
  const resetManualFlow = () => {
    setFile(null);
    setImageSrc(null);
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-full max-w-lg relative">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold">写真を追加</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-700" aria-label="閉じる">
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-center bg-slate-900/50 p-1 rounded-lg mb-4">
            <button onClick={() => setMode('qr')} className={`w-1/2 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-colors ${mode === 'qr' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
              <QrCodeIcon className="h-5 w-5" /> QRスキャン
            </button>
            <button onClick={() => setMode('manual')} className={`w-1/2 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-colors ${mode === 'manual' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
              <UploadIcon className="h-5 w-5" /> 手動アップロード
            </button>
          </div>
          
          <div className="space-y-4">
            {mode === 'qr' && (
              <>
                {qrStep === 'scan' && (
                  <div className="w-full aspect-square bg-slate-900 rounded-md flex flex-col items-center justify-center text-slate-400 border border-slate-700">
                    <QrCodeIcon className="h-16 w-16 mb-4" />
                    <p className="text-center">個体ラベルのQRコードを<br/>カメラに向けてください。</p>
                    <button onClick={handleScan} disabled={isProcessing} className="mt-4 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 disabled:bg-emerald-800">
                      {isProcessing ? 'スキャン中...' : 'スキャン実行 (シミュレーション)'}
                    </button>
                  </div>
                )}
                {qrStep === 'capture' && (
                  <div className="w-full aspect-square bg-slate-900 rounded-md flex flex-col items-center justify-center text-slate-400 border border-slate-700">
                     <div className="flex items-center text-emerald-400 mb-4">
                        <CheckCircleIcon className="h-6 w-6 mr-2"/>
                        <p>{message}</p>
                    </div>
                    <CameraIcon className="h-16 w-16 mb-4" />
                    <p>カメラプレビュー</p>
                     <button onClick={handleCapture} disabled={isProcessing} className="mt-4 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 disabled:bg-emerald-800">
                      撮影 (シミュレーション)
                    </button>
                  </div>
                )}
                {qrStep === 'preview' && imageSrc && (
                   <div className="w-full aspect-[4/3] bg-slate-900 rounded-md flex items-center justify-center border border-slate-700 overflow-hidden">
                      <img src={imageSrc} alt="撮影プレビュー" className="max-w-full max-h-full" />
                   </div>
                )}
              </>
            )}
            {mode === 'manual' && (
                <div>
                    {!imageSrc ? (
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <UploadIcon className="mx-auto h-12 w-12 text-slate-400" />
                                <div className="flex text-sm text-slate-400">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-slate-800 rounded-md font-medium text-emerald-400 hover:text-emerald-300 focus-within:outline-none">
                                    <span>ファイルをアップロード</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleManualFileChange} accept="image/png, image/jpeg, image/webp" />
                                </label>
                                <p className="pl-1">またはドラッグ＆ドロップ</p>
                                </div>
                                {file ? <p className="text-xs text-slate-300">{file.name}</p> : <p className="text-xs text-slate-500">PNG, JPG, WEBP up to 10MB</p>}
                            </div>
                        </div>
                    ) : (
                        <div className="w-full aspect-[4/3] bg-slate-900 rounded-md flex items-center justify-center border border-slate-700 overflow-hidden">
                           <img src={imageSrc} alt="アップロードプレビュー" className="max-w-full max-h-full" />
                        </div>
                    )}
                </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-end p-4 bg-slate-800/50 border-t border-slate-700 rounded-b-lg">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 rounded-md hover:bg-slate-700">キャンセル</button>
          
          {(mode === 'qr' && qrStep === 'preview' || mode === 'manual' && imageSrc) && (
            <button onClick={handleUpload} disabled={isProcessing || !imageSrc} className="ml-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 disabled:bg-emerald-800 disabled:cursor-not-allowed">
              {isProcessing ? '処理中...' : 'アップロード実行'}
            </button>
          )}

          {(mode === 'qr' && qrStep !== 'scan' ) && (
            <button onClick={resetQrFlow} className="ml-2 px-4 py-2 text-sm font-medium text-slate-300 rounded-md hover:bg-slate-700">やり直す</button>
          )}

           {(mode === 'manual' && imageSrc ) && (
            <button onClick={resetManualFlow} className="ml-2 px-4 py-2 text-sm font-medium text-slate-300 rounded-md hover:bg-slate-700">クリア</button>
          )}
        </div>
      </div>
    </div>
  );
};
