import { useState, useEffect } from 'react';

const StatsDisplay = ({ stats, isVisible }) => {
  const [animatedStats, setAnimatedStats] = useState({
    originalSize: 0,
    compressedSize: 0,
    ratio: 0,
    spaceSaved: 0
  });

  useEffect(() => {
    if (isVisible && stats) {
      const duration = 1500;
      const steps = 60;
      const stepDuration = duration / steps;

      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        
        setAnimatedStats({
          originalSize: Math.floor(stats.originalSize * progress),
          compressedSize: Math.floor(stats.compressedSize * progress),
          ratio: parseFloat((stats.ratio * progress).toFixed(2)),
          spaceSaved: Math.floor(stats.spaceSaved * progress)
        });

        if (currentStep >= steps) {
          clearInterval(timer);
          setAnimatedStats(stats);
        }
      }, stepDuration);

      return () => clearInterval(timer);
    }
  }, [stats, isVisible]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getRatioColor = (ratio) => {
    if (ratio >= 50) return '#10b981'; // Green
    if (ratio >= 25) return '#f59e0b'; // Orange  
    return '#ef4444'; // Red
  };

  if (!stats || !isVisible) return null;

  return (
    <div className="stats-display">
      <h3>Compression Statistics</h3>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon original">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatFileSize(animatedStats.originalSize)}</div>
            <div className="stat-label">Original Size</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon compressed">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15l-6-6v4.5c0 .83-.67 1.5-1.5 1.5h-7c-.83 0-1.5.67-1.5 1.5v1c0 .83.67 1.5 1.5 1.5h7c.83 0 1.5.67 1.5 1.5V21l6-6z"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatFileSize(animatedStats.compressedSize)}</div>
            <div className="stat-label">Compressed Size</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon ratio">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <div className="stat-content">
            <div 
              className="stat-value" 
              style={{ color: getRatioColor(animatedStats.ratio) }}
            >
              {animatedStats.ratio}%
            </div>
            <div className="stat-label">Compression Ratio</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon saved">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5Z"/>
              <path d="M12 5L8 21l4-7 4 7-4-16"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatFileSize(animatedStats.spaceSaved)}</div>
            <div className="stat-label">Space Saved</div>
          </div>
        </div>
      </div>

      <div className="compression-bar">
        <div className="bar-container">
          <div 
            className="compression-fill" 
            style={{ 
              width: `${Math.min(animatedStats.ratio, 100)}%`,
              backgroundColor: getRatioColor(animatedStats.ratio)
            }}
          ></div>
        </div>
        <div className="bar-labels">
          <span>Compression Efficiency</span>
          <span className="efficiency-badge" style={{ color: getRatioColor(animatedStats.ratio) }}>
            {stats.efficiency}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatsDisplay;