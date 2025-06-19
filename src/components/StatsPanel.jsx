import './StatsPanel.css';

function StatsPanel({ stats, isProcessing }) {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (isProcessing) {
    return (
      <div className="stats-panel">
        <h2>Processing...</h2>
        <div className="processing-indicator">
          <div className="spinner"></div>
          <p>Please wait while your file is being processed</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="stats-panel">
        <h2>Compression Statistics</h2>
        <div className="no-stats">
          <p>Upload and process a file to see statistics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-panel">
      <h2>Processing Results</h2>
      
      <div className="stats-grid">
        {stats.type === 'compression' ? (
          <>
            <div className="stat-item">
              <label>Original Size</label>
              <value>{formatFileSize(stats.originalSize)}</value>
            </div>
            
            <div className="stat-item">
              <label>Compressed Size</label>
              <value>{formatFileSize(stats.compressedSize)}</value>
            </div>
            
            <div className="stat-item highlight">
              <label>Compression Ratio</label>
              <value>{stats.compressionRatio}%</value>
            </div>
            
            <div className="stat-item">
              <label>Algorithm Used</label>
              <value>{stats.algorithm}</value>
            </div>
            
            <div className="stat-item">
              <label>Processing Time</label>
              <value>{formatTime(stats.compressionTime)}</value>
            </div>
            
            <div className="stat-item">
              <label>Space Saved</label>
              <value>{formatFileSize(stats.originalSize - stats.compressedSize)}</value>
            </div>
          </>
        ) : (
          <>
            <div className="stat-item">
              <label>Decompressed Size</label>
              <value>{formatFileSize(stats.decompressedSize)}</value>
            </div>
            
            <div className="stat-item">
              <label>Processing Time</label>
              <value>{formatTime(stats.decompressionTime)}</value>
            </div>
            
            <div className="stat-item highlight">
              <label>Status</label>
              <value>✅ Successfully Decompressed</value>
            </div>
          </>
        )}
      </div>

      {stats.type === 'compression' && (
        <div className="compression-visual">
          <div className="size-comparison">
            <div className="original-bar">
              <div className="bar-fill original"></div>
              <span>Original</span>
            </div>
            <div className="compressed-bar">
              <div 
                className="bar-fill compressed"
                style={{ 
                  width: `${(stats.compressedSize / stats.originalSize) * 100}%` 
                }}
              ></div>
              <span>Compressed</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StatsPanel;