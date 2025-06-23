import { useState } from 'react';

const ControlPanel = ({ 
  onCompress, 
  onDecompress, 
  onDownload, 
  hasFile, 
  hasCompressed, 
  hasDecompressed,
  isProcessing,
  fileName,
  processingStage,
  processingProgress
}) => {
  const [activeOperation, setActiveOperation] = useState(null);

  const handleCompress = () => {
    setActiveOperation('compress');
    onCompress();
  };

  const handleDecompress = () => {
    setActiveOperation('decompress');
    onDecompress();
  };

  const handleDownload = (type) => {
    onDownload(type);
  };

  return (
    <div className="control-panel">
      <h3>File Operations</h3>
      
      {/* Processing Status Display */}
      {isProcessing && processingStage && (
        <div className="processing-status">
          <div className="status-header">
            <div className="status-icon">
              <div className="spinner"></div>
            </div>
            <div className="status-text">
              <h4>Processing...</h4>
              <p>{processingStage}</p>
            </div>
          </div>
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${processingProgress}%` }}
              ></div>
            </div>
            <span className="progress-text">{processingProgress.toFixed(1)}%</span>
          </div>
        </div>
      )}
      
      <div className="controls-grid">
        <button
          className={`control-btn compress ${activeOperation === 'compress' ? 'active' : ''}`}
          onClick={handleCompress}
          disabled={!hasFile || isProcessing}
        >
          <div className="btn-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <polyline points="16,6 12,2 8,6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
          </div>
          <span>Compress File</span>
          {isProcessing && activeOperation === 'compress' && (
            <div className="btn-spinner"></div>
          )}
        </button>

        <button
          className={`control-btn decompress ${activeOperation === 'decompress' ? 'active' : ''}`}
          onClick={handleDecompress}
          disabled={!hasCompressed || isProcessing}
        >
          <div className="btn-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <polyline points="8,18 12,22 16,18"/>
              <line x1="12" y1="22" x2="12" y2="9"/>
            </svg>
          </div>
          <span>Decompress File</span>
          {isProcessing && activeOperation === 'decompress' && (
            <div className="btn-spinner"></div>
          )}
        </button>
      </div>

      {(hasCompressed || hasDecompressed) && (
        <div className="download-section">
          <h4>Download Files</h4>
          <div className="download-buttons">
            {hasCompressed && (
              <button
                className="download-btn compressed"
                onClick={() => handleDownload('compressed')}
                disabled={isProcessing}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-15"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download Compressed ({fileName?.replace(/\.[^/.]+$/, '.huf')})
              </button>
            )}
            
            {hasDecompressed && (
              <button
                className="download-btn decompressed"
                onClick={() => handleDownload('decompressed')}
                disabled={isProcessing}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-15"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download Decompressed ({fileName})
              </button>
            )}
          </div>
        </div>
      )}

      {hasFile && (
        <div className="file-info-panel">
          <h4>Current File</h4>
          <div className="file-details">
            <div className="file-name">{fileName}</div>
            <div className="file-status">
              {hasCompressed ? (
                <span className="status-badge success">Compression completed</span>
              ) : isProcessing ? (
                <span className="status-badge processing">Processing...</span>
              ) : (
                <span className="status-badge pending">Ready for compression</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;