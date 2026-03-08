import React, { useState } from 'react';
import { Wifi, WifiOff, Signal, RefreshCw } from 'lucide-react';
import { useNetwork } from '../contexts/NetworkContext';
import { NETWORK_STATUS } from '../services/networkMonitor';
import { getNetworkMonitor } from '../services/networkMonitor';
import OfflineDoubtsPanel from './OfflineDoubtsPanel';

/**
 * Global Network Status Indicator
 * Shows on all pages, clickable to open doubts panel
 */
const GlobalNetworkIndicator = () => {
  const { networkStatus, pendingDoubtsCount, refreshPendingCount } = useNetwork();
  const [showDoubtsPanel, setShowDoubtsPanel] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    const networkMonitor = getNetworkMonitor();
    networkMonitor.forceRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getStatusConfig = () => {
    switch (networkStatus) {
      case NETWORK_STATUS.ONLINE:
        return {
          icon: <Wifi className="h-3 w-3 md:h-4 md:w-4" />,
          text: 'Online',
          color: 'bg-green-500',
          textColor: 'text-green-700',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          emoji: '🟢'
        };
      case NETWORK_STATUS.LOW_NETWORK:
        return {
          icon: <Signal className="h-3 w-3 md:h-4 md:w-4" />,
          text: 'Low Network',
          color: 'bg-yellow-500',
          textColor: 'text-yellow-700',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          emoji: '🟡'
        };
      case NETWORK_STATUS.OFFLINE:
        return {
          icon: <WifiOff className="h-3 w-3 md:h-4 md:w-4" />,
          text: 'Offline',
          color: 'bg-red-500',
          textColor: 'text-red-700',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          emoji: '🔴'
        };
      default:
        return {
          icon: <Wifi className="h-3 w-3 md:h-4 md:w-4" />,
          text: 'Checking...',
          color: 'bg-gray-500',
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          emoji: '⚪'
        };
    }
  };

  const config = getStatusConfig();

  const handleClick = () => {
    if (pendingDoubtsCount > 0 || networkStatus === NETWORK_STATUS.OFFLINE) {
      setShowDoubtsPanel(true);
    }
  };

  const handleClosePanel = () => {
    setShowDoubtsPanel(false);
    refreshPendingCount();
  };

  return (
    <>
      <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
        {/* Network Status */}
        <div
          className={`flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-lg border ${config.bgColor} ${config.borderColor} shadow-lg transition-all hover:shadow-xl ${pendingDoubtsCount > 0 || networkStatus === NETWORK_STATUS.OFFLINE ? 'cursor-pointer' : ''}`}
          onClick={handleClick}
          title={pendingDoubtsCount > 0 ? 'Click to view pending doubts' : 'Network status'}
        >
          <div className={`${config.color} rounded-full p-1 md:p-1.5 animate-pulse`}>
            {config.icon}
          </div>
          <div className="flex flex-col">
            <span className={`text-xs md:text-sm font-semibold ${config.textColor}`}>
              {config.emoji} {config.text}
            </span>
            {pendingDoubtsCount > 0 && (
              <span className="text-xs text-gray-600">
                {pendingDoubtsCount} pending
              </span>
            )}
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 md:p-2.5 bg-white border-2 border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-all hover:bg-gray-50 disabled:opacity-50"
          title="Refresh network status"
        >
          <RefreshCw className={`h-3 w-3 md:h-4 md:w-4 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Offline Doubts Panel */}
      <OfflineDoubtsPanel
        isOpen={showDoubtsPanel}
        onClose={handleClosePanel}
      />
    </>
  );
};

export default GlobalNetworkIndicator;
