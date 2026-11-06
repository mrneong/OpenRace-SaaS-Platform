import React from 'react';

export interface StravaConnectButtonProps {
  isConnected: boolean;
  athleteName?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export const StravaConnectButton: React.FC<StravaConnectButtonProps> = ({
  isConnected,
  athleteName,
  onConnect,
  onDisconnect,
}) => {
  if (isConnected) {
    return (
      <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-sm font-medium text-slate-200">
          Đã kết nối: <strong className="text-orange-400">{athleteName || 'Strava Athlete'}</strong>
        </span>
        <button
          onClick={onDisconnect}
          className="text-xs text-slate-400 hover:text-red-400 transition-colors ml-auto underline"
        >
          Hủy kết nối
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onConnect}
      className="flex items-center justify-center space-x-2 w-full bg-[#FC5200] hover:bg-[#e04900] text-white font-medium px-4 py-3 rounded-xl transition-all shadow-md shadow-orange-600/20 active:scale-[0.98]"
    >
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7.29 14.344h4.172" />
      </svg>
      <span>Kết nối với Strava</span>
    </button>
  );
};

