import { useState } from 'react';
import FileUpload from './components/FileUpload';
import CompressionPanel from './components/CompressionPanel';
import StatsPanel from './components/StatsPanel';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [compressionStats, setCompressionStats] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isDecompressing, setIsDecompressing] = useState(false);
  const [downloadLink, setDownloadLink] = useState(null);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setCompressionStats(null);
    setDownloadLink(null);
  };

  const handleCompressionComplete = (stats, filename) => {
    setCompressionStats(stats);
    setDownloadLink({
      filename,
      type: 'compressed'
    });
    setIsCompressing(false);
  };

  const handleDecompressionComplete = (stats, filename) => {
    setCompressionStats(stats);
    setDownloadLink({
      filename,
      type: 'decompressed'
    });
    setIsDecompressing(false);
  };

  const resetApp = () => {
    setSelectedFile(null);
    setCompressionStats(null);
    setDownloadLink(null);
    setIsCompressing(false);
    setIsDecompressing(false);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>File Compressor </h1>
        <p>Advanced file compression using Huffman coding algorithm</p>
      </header>

      <main className="app-main">
        <div className="app-grid">
          <div className="upload-section">
            <FileUpload 
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
            />
          </div>

          <div className="controls-section">
            <CompressionPanel
              selectedFile={selectedFile}
              onCompressionStart={() => setIsCompressing(true)}
              onDecompressionStart={() => setIsDecompressing(true)}
              onCompressionComplete={handleCompressionComplete}
              onDecompressionComplete={handleDecompressionComplete}
              isCompressing={isCompressing}
              isDecompressing={isDecompressing}
              downloadLink={downloadLink}
              onReset={resetApp}
            />
          </div>

          <div className="stats-section">
            <StatsPanel 
              stats={compressionStats}
              isProcessing={isCompressing || isDecompressing}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;