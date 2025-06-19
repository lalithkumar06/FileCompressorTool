import { useState } from 'react';
import './CompressionPanel.css';

function CompressionPanel({ 
  selectedFile, 
  onCompressionStart, 
  onDecompressionStart,
  onCompressionComplete, 
  onDecompressionComplete,
  isCompressing, 
  isDecompressing,
  downloadLink,
  onReset 
}) {
  const [algorithm, setAlgorithm] = useState('combined');
  const [progress, setProgress] = useState(0);
  const [originalFilename, setOriginalFilename] = useState('');

  const handleCompress = async () => {
    if (!selectedFile) return;

    onCompressionStart();
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('algorithm', algorithm);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      const response = await fetch('http://localhost:3001/api/compress', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Compression failed');
      }

      const result = await response.json();
      onCompressionComplete({
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        compressionRatio: result.compressionRatio,
        compressionTime: result.compressionTime,
        algorithm: result.algorithm,
        type: 'compression'
      }, result.filename);

      setOriginalFilename(selectedFile.name);

    } catch (error) {
      alert('Compression failed: ' + error.message);
      onCompressionComplete(null, null);
    }
  };

  const handleDecompress = async () => {
    if (!selectedFile) return;

    onDecompressionStart();
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('algorithm', algorithm);
      formData.append('originalFilename', originalFilename || 'decompressed.pdf');

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      const response = await fetch('http://localhost:3001/api/decompress', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Decompression failed');
      }

      const result = await response.json();
      onDecompressionComplete({
        decompressedSize: result.decompressedSize,
        decompressionTime: result.decompressionTime,
        type: 'decompression'
      }, result.filename);

    } catch (error) {
      alert('Decompression failed: ' + error.message);
      onDecompressionComplete(null, null);
    }
  };

  const handleDownload = async () => {
    if (!downloadLink) return;

    try {
      const response = await fetch(`http://localhost:3001/api/download/${downloadLink.filename}`);
      
      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadLink.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      alert('Download failed: ' + error.message);
    }
  };

  const isFileCompressed = selectedFile && selectedFile.name.endsWith('.bin');
  const canCompress = selectedFile && !isFileCompressed && !isCompressing && !isDecompressing;
  const canDecompress = selectedFile && isFileCompressed && !isCompressing && !isDecompressing;

  return (
    <div className="compression-panel">
      <h2>Compression Controls</h2>
      
      <div className="algorithm-selection">
        <label>Algorithm:</label>
        <select 
          value={algorithm} 
          onChange={(e) => setAlgorithm(e.target.value)}
          disabled={isCompressing || isDecompressing}
        >
          <option value="huffman">Huffman Coding</option>
        </select>
      </div>

      {isFileCompressed && (
        <div className="original-filename">
          <label>Original filename (optional):</label>
          <input
            type="text"
            value={originalFilename}
            onChange={(e) => setOriginalFilename(e.target.value)}
            placeholder="e.g., document.pdf"
            disabled={isCompressing || isDecompressing}
          />
        </div>
      )}

      <div className="action-buttons">
        {!isFileCompressed ? (
          <button 
            className="compress-btn"
            onClick={handleCompress}
            disabled={!canCompress}
          >
            {isCompressing ? 'Compressing...' : 'Compress File'}
          </button>
        ) : (
          <button 
            className="decompress-btn"
            onClick={handleDecompress}
            disabled={!canDecompress}
          >
            {isDecompressing ? 'Decompressing...' : 'Decompress File'}
          </button>
        )}

        {downloadLink && (
          <button 
            className="download-btn"
            onClick={handleDownload}
          >
            Download {downloadLink.type === 'compressed' ? 'Compressed' : 'Decompressed'} File
          </button>
        )}

        <button 
          className="reset-btn"
          onClick={onReset}
          disabled={isCompressing || isDecompressing}
        >
          Reset
        </button>
      </div>

      {(isCompressing || isDecompressing) && (
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="progress-text">{Math.round(progress)}%</span>
        </div>
      )}
    </div>
  );
}

export default CompressionPanel;