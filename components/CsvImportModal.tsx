import React, { useState, useCallback } from 'react';
import { XIcon, UploadIcon, CheckCircleIcon, XCircleIcon } from './icons';

interface CsvImportModalProps {
  onClose: () => void;
}

enum ImportStatus {
  IDLE,
  UPLOADING,
  SUCCESS,
  ERROR,
}

type ImportMode = 'skip' | 'overwrite' | 'new_assignment';

export const CsvImportModal: React.FC<CsvImportModalProps> = ({ onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ImportStatus>(ImportStatus.IDLE);
  const [message, setMessage] = useState('');
  const [importMode, setImportMode] = useState<ImportMode>('skip');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setStatus(ImportStatus.IDLE);
      setMessage('');
    }
  };

  const handleImport = useCallback(() => {
    if (!file) {
      setStatus(ImportStatus.ERROR);
      setMessage('ファイルを選択してください。');
      return;
    }

    setStatus(ImportStatus.UPLOADING);
    setMessage('インポート処理を実行中です...');

    // Simulate backend processing
    setTimeout(() => {
      // Simulate a partial success/error scenario
      const isSuccess = Math.random() > 0.3; // 70% chance of success
      if (isSuccess) {
        setStatus(ImportStatus.SUCCESS);
        setMessage('インポートが完了しました。30件中28件成功、2件失敗。詳細はレポートを確認してください。');
      } else {
        setStatus(ImportStatus.ERROR);
        setMessage('インポートに失敗しました。CSVのフォーマットを確認してください。');
      }
    }, 2000);
  }, [file, importMode]);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-full max-w-lg relative">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold">CSVインポート</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-700">
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-sm text-slate-400">
            個体データまたは計測データをCSVファイルで一括登録します。<br />
            <a href="data/templates/individuals_template.csv" download className="text-emerald-400 hover:underline">個体テンプレート</a> / 
            <a href="data/templates/measurements_template.csv" download className="text-emerald-400 hover:underline"> 計測テンプレート</a>
          </p>

          <div>
             <label className="block text-sm font-medium text-slate-300 mb-2">
              インポートモード
            </label>
            <div className="flex space-x-4">
                <label className="flex items-center">
                    <input type="radio" name="import-mode" value="skip" checked={importMode === 'skip'} onChange={() => setImportMode('skip')} className="form-radio h-4 w-4 text-emerald-600 bg-slate-700 border-slate-600 focus:ring-emerald-500" />
                    <span className="ml-2 text-sm text-slate-300">スキップ</span>
                </label>
                 <label className="flex items-center">
                    <input type="radio" name="import-mode" value="overwrite" checked={importMode === 'overwrite'} onChange={() => setImportMode('overwrite')} className="form-radio h-4 w-4 text-emerald-600 bg-slate-700 border-slate-600 focus:ring-emerald-500" />
                    <span className="ml-2 text-sm text-slate-300">上書き</span>
                </label>
                 <label className="flex items-center">
                    <input type="radio" name="import-mode" value="new_assignment" checked={importMode === 'new_assignment'} onChange={() => setImportMode('new_assignment')} className="form-radio h-4 w-4 text-emerald-600 bg-slate-700 border-slate-600 focus:ring-emerald-500" />
                    <span className="ml-2 text-sm text-slate-300">新規割当</span>
                </label>
            </div>
            <p className="text-xs text-slate-500 mt-1">コードが重複した場合の動作を選択します。</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="file-upload">
              CSVファイル
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <UploadIcon className="mx-auto h-12 w-12 text-slate-400" />
                <div className="flex text-sm text-slate-400">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-slate-800 rounded-md font-medium text-emerald-400 hover:text-emerald-300 focus-within:outline-none">
                    <span>ファイルをアップロード</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".csv" />
                  </label>
                  <p className="pl-1">またはドラッグ＆ドロップ</p>
                </div>
                {file ? (
                    <p className="text-xs text-slate-300">{file.name}</p>
                ) : (
                    <p className="text-xs text-slate-500">CSV up to 10MB</p>
                )}
              </div>
            </div>
          </div>
          
          {status !== ImportStatus.IDLE && (
            <div className={`flex items-start space-x-3 p-3 rounded-md text-sm ${
              status === ImportStatus.SUCCESS ? 'bg-emerald-900/50 text-emerald-300' : ''
            } ${
              status === ImportStatus.ERROR ? 'bg-red-900/50 text-red-300' : ''
            } ${
              status === ImportStatus.UPLOADING ? 'bg-blue-900/50 text-blue-300 animate-pulse' : ''
            }`}>
              {status === ImportStatus.SUCCESS && <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />}
              {status === ImportStatus.ERROR && <XCircleIcon className="h-5 w-5 flex-shrink-0" />}
              <p>{message}</p>
            </div>
          )}

        </div>
        
        <div className="flex items-center justify-end p-4 bg-slate-800/50 border-t border-slate-700 rounded-b-lg">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 rounded-md hover:bg-slate-700">キャンセル</button>
          <button onClick={handleImport} disabled={status === ImportStatus.UPLOADING} className="ml-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 disabled:bg-emerald-800 disabled:cursor-not-allowed">
            {status === ImportStatus.UPLOADING ? '処理中...' : 'インポート実行'}
          </button>
        </div>
      </div>
    </div>
  );
};