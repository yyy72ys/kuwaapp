
import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    if (stream) return; // Camera already running
    
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing rear camera:", err);
        // Fallback to any camera if environment facing fails
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (fallBackErr) {
            console.error("Error accessing any camera:", fallBackErr);
            setCameraError("カメラにアクセスできませんでした。ブラウザの設定でカメラへのアクセスを許可してください。");
        }
      }
    } else {
        setCameraError("お使いのブラウザはカメラ機能をサポートしていません。");
    }
  }, [stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      if(videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [stream]);

  useEffect(() => {
    if (mode === 'qr' && qrStep !== 'preview') {
      startCamera();
    } else {
      stopCamera();
    }
    // Cleanup on unmount
    return () => {
      stopCamera();
    };
  }, [mode, qrStep, startCamera, stopCamera]);


  const handleScan = useCallback(() => {
    setIsProcessing(true);
    setMessage(`個体コード「${individualCode}」をスキャン中...`);
    setTimeout(() => {
      setMessage(`コード「${individualCode}」を認識しました。撮影してください。`);
      setQrStep('capture');
      setIsProcessing(false);
    }, 2500);
  }, [individualCode]);

  useEffect(() => {
    if (mode === 'qr' && qrStep === 'scan' && stream && !isProcessing) {
        handleScan();
    }
  }, [mode, qrStep, stream, isProcessing, handleScan]);


  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/webp');
        setImageSrc(dataUrl);
        setQrStep('preview');
        stopCamera();
      }
    }
  }, [stopCamera]);

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

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const QrScannerView = () => {
    if (qrStep === 'preview' && imageSrc) {
        return (
             <div className="w-full aspect-[4/3] bg-slate-900 rounded-md flex items-center justify-center border border-slate-700 overflow-hidden">
                <img src={imageSrc} alt="撮影プレビュー" className="w-full h-full object-contain" />
             </div>
        );
    }

    if (cameraError) {
        return (
            <div className="w-full aspect-square bg-slate-900 rounded-md flex flex-col items-center justify-center text-red-400 border border-slate-700 p-4">
                <XCircleIcon className="h-12 w-12 mb-4" />
                <p className="text-center">{cameraError}</p>
            </div>
        );
    }

    return (
        <div className="w-full aspect-square bg-slate-900 rounded-md flex flex-col items-center justify-center text-slate-400 border border-slate-700 overflow-hidden relative">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center p-4">
                {qrStep === 'scan' && (
                    <div className="text-center text-white">
                        <QrCodeIcon className="h-16 w-16 mb-4 mx-auto animate-pulse" />
                        <p>{message || 'QRコードを探しています...'}</p>
                    </div>
                )}
                {qrStep === 'capture' && (
                    <div className="text-center">
                        <div className="flex items-center text-emerald-300 mb-4 bg-black/50 p-2 rounded-md">
                            <CheckCircleIcon className="h-6 w-6 mr-2"/>
                            <p>{message}</p>
                        </div>
                        <button onClick={handleCapture} className="p-4 bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-emerald-500">
                           <CameraIcon className="h-8 w-8 text-slate-800" />
                           <span className="sr-only">撮影</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
  };
  
  const XCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <canvas ref={canvasRef} className="hidden" />
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-full max-w-lg relative">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold">写真を追加</h2>
          <button onClick={handleClose} className="p-1 rounded-full hover:bg-slate-700" aria-label="閉じる">
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
            {mode === 'qr' ? <QrScannerView /> : (
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
                           <img src={imageSrc} alt="アップロードプレビュー" className="max-w-full max-h-full object-contain" />
                        </div>
                    )}
                </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-end p-4 bg-slate-800/50 border-t border-slate-700 rounded-b-lg">
          <button onClick={handleClose} className="px-4 py-2 text-sm font-medium text-slate-300 rounded-md hover:bg-slate-700">キャンセル</button>
          
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
