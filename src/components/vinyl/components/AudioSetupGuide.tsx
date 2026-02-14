import React from 'react';

interface AudioSetupGuideProps {
  isVisible: boolean;
  onClose: () => void;
}

export function AudioSetupGuide({ isVisible, onClose }: AudioSetupGuideProps) {
  if (!isVisible) return null;

  const requiredFiles = [
    { file: "gravity.mp3", song: "Gravity", album: "WASTELAND" },
    { file: "vivid-dreams.mp3", song: "VIVID DREAMS", album: "99.9%" },
    { file: "hereditary.mp3", song: "Hereditary", album: "The Never Story" },
    { file: "being-so-normal.mp3", song: "Being so Normal", album: "Being So Normal" },
    { file: "fallen.mp3", song: "Fallen", album: "Moodring" }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            🎵 Setup Vinyl Songs
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Add these songs to your <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">public/songs/</code> folder:
          </p>
          
          <div className="space-y-2">
            {requiredFiles.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.song}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {item.album}
                  </div>
                </div>
                <code className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                  {item.file}
                </code>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> You'll need to obtain these songs legally through official channels 
              (Spotify, Apple Music, etc.) and convert them to MP3 format for use in this app.
            </p>
          </div>
          
          <button 
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
