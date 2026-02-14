import { useState, useEffect } from 'react';
import { withBasePath } from "@/lib/basePath";

interface FileStatusCheckerProps {
  isVisible: boolean;
  onClose: () => void;
}

export function FileStatusChecker({ isVisible, onClose }: FileStatusCheckerProps) {
  const [fileStatus, setFileStatus] = useState<{[key: string]: boolean}>({});
  const [checking, setChecking] = useState(false);

  const requiredFiles = {
    "/songs/gravity.mp3": "Gravity - Brent Faiyaz (WASTELAND)",
    "/songs/vivid-dreams.mp3": "VIVID DREAMS - KAYTRANADA (99.9%)",
    "/songs/hereditary.mp3": "Hereditary - JID (The Never Story)",
    "/songs/being-so-normal.mp3": "Being So Normal - Peach Pit (Being So Normal)",
    "/songs/fallen.mp3": "Fallen - Mya (Moodring)"
  };

  const checkFiles = async () => {
    setChecking(true);
    const status: {[key: string]: boolean} = {};

    const checkSingleFile = async (path: string) => {
      const url = withBasePath(path);

      try {
        const response = await fetch(url, { method: "HEAD", cache: "no-store" });
        if (response.ok) return true;
      } catch {
        // Ignore and fall through to range request.
      }

      try {
        const response = await fetch(url, {
          method: "GET",
          cache: "no-store",
          headers: {
            Range: "bytes=0-1"
          }
        });
        return response.ok || response.status === 206;
      } catch {
        return false;
      }
    };

    for (const [path, _] of Object.entries(requiredFiles)) {
      status[path] = await checkSingleFile(path);
    }

    setFileStatus(status);
    setChecking(false);
  };

  useEffect(() => {
    if (isVisible) {
      checkFiles();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const allFilesPresent = Object.values(fileStatus).every(status => status);
  const filesFound = Object.values(fileStatus).filter(status => status).length;
  const totalFiles = Object.keys(requiredFiles).length;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              🎵 File Status Check
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Status Summary */}
          <div className={`p-4 rounded-lg mb-6 ${
            allFilesPresent 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-amber-50 border border-amber-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`text-2xl ${
                allFilesPresent ? 'text-green-600' : 'text-amber-600'
              }`}>
                {allFilesPresent ? '✅' : '⚠️'}
              </div>
              <div>
                <div className={`font-medium ${
                  allFilesPresent ? 'text-green-800' : 'text-amber-800'
                }`}>
                  {allFilesPresent 
                    ? 'All files ready!' 
                    : `${filesFound}/${totalFiles} files found`
                  }
                </div>
                <div className={`text-sm ${
                  allFilesPresent ? 'text-green-600' : 'text-amber-600'
                }`}>
                  {allFilesPresent 
                    ? 'Your vinyl player is ready to rock!' 
                    : 'Add missing files to /public/songs/ folder'
                  }
                </div>
              </div>
            </div>
          </div>

          {/* File List */}
          <div className="space-y-3">
            {Object.entries(requiredFiles).map(([path, description]) => {
              const isPresent = fileStatus[path];
              const fileName = path.split('/').pop();
              
              return (
                <div key={path} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className={`text-lg ${
                    checking ? 'text-gray-400' : isPresent ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {checking ? '🔄' : isPresent ? '✅' : '❌'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {fileName}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={checkFiles}
              disabled={checking}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {checking ? '🔄 Checking...' : '🔄 Recheck Files'}
            </button>
            {allFilesPresent && (
              <button
                onClick={onClose}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🎧 Ready to Play!
              </button>
            )}
          </div>

          {/* Help Text */}
          {!allFilesPresent && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                <div className="font-medium mb-1">📁 How to add files:</div>
                <div>1. Download or export the track MP3s</div>
                <div>2. Rename to exact names shown above</div>
                <div>3. Copy to /public/songs/ folder</div>
                <div>4. Click "Recheck Files"</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
