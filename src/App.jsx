import { useState, useCallback } from 'react';
import Header from './components/Header';
import FileUploader from './components/FileUploader';
import ControlPanel from './components/ControlPanel';
import StatsDisplay from './components/StatsDisplay';
import { HuffmanCoder, downloadFile } from './utils/huffman';
import './App.css';

function App() {
  const [currentFile, setCurrentFile] = useState(null);
  const [compressedData, setCompressedData] = useState(null);
  const [decompressedData, setDecompressedData] = useState(null);
  const [stats, setStats] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);

  const huffmanCoder = new HuffmanCoder();

  const handleFileProcessed = useCallback((file) => {
    setCurrentFile(file);
    setCompressedData(null);
    setDecompressedData(null);
    setStats(null);
    setShowStats(false);
    setProcessingStage('');
    setProcessingProgress(0);
  }, []);

  const handleCompress = useCallback(async () => {
    if (!currentFile) return;

    setIsProcessing(true);
    setProcessingStage('Analyzing file structure...');
    setProcessingProgress(0);

    try {
      // Simulate processing stages with progress updates
      const stages = [
        { name: 'Analyzing file structure...', duration: 200 },
        { name: 'Building frequency table...', duration: 300 },
        { name: 'Constructing Huffman tree...', duration: 400 },
        { name: 'Generating compression codes...', duration: 300 },
        { name: 'Compressing data...', duration: 500 },
        { name: 'Finalizing compression...', duration: 200 }
      ];

      let totalProgress = 0;
      const progressPerStage = 100 / stages.length;

      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        setProcessingStage(stage.name);
        
        // Animate progress within each stage
        const stageSteps = 20;
        const stepDuration = stage.duration / stageSteps;
        
        for (let step = 0; step <= stageSteps; step++) {
          const stageProgress = (step / stageSteps) * progressPerStage;
          setProcessingProgress(totalProgress + stageProgress);
          await new Promise(resolve => setTimeout(resolve, stepDuration));
        }
        
        totalProgress += progressPerStage;
      }

      // Perform actual compression
      const result = huffmanCoder.compress(currentFile.data);
      setCompressedData(result);
      
      const compressionStats = huffmanCoder.getStats(currentFile.data, result.compressed);
      setStats(compressionStats);
      setShowStats(true);
      
      setProcessingStage('Compression completed!');
      setProcessingProgress(100);
      
      // Clear processing state after a short delay
      setTimeout(() => {
        setProcessingStage('');
        setProcessingProgress(0);
      }, 1500);
      
    } catch (error) {
      console.error('Compression error:', error);
      alert('Error compressing file. Please try again.');
      setProcessingStage('Compression failed');
    } finally {
      setIsProcessing(false);
    }
  }, [currentFile]);

  const handleDecompress = useCallback(async () => {
    if (!compressedData) return;

    setIsProcessing(true);
    setProcessingStage('Preparing decompression...');
    setProcessingProgress(0);

    try {
      const stages = [
        { name: 'Preparing decompression...', duration: 200 },
        { name: 'Reconstructing Huffman tree...', duration: 300 },
        { name: 'Decoding compressed data...', duration: 500 },
        { name: 'Rebuilding original file...', duration: 400 },
        { name: 'Finalizing decompression...', duration: 200 }
      ];

      let totalProgress = 0;
      const progressPerStage = 100 / stages.length;

      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        setProcessingStage(stage.name);
        
        const stageSteps = 15;
        const stepDuration = stage.duration / stageSteps;
        
        for (let step = 0; step <= stageSteps; step++) {
          const stageProgress = (step / stageSteps) * progressPerStage;
          setProcessingProgress(totalProgress + stageProgress);
          await new Promise(resolve => setTimeout(resolve, stepDuration));
        }
        
        totalProgress += progressPerStage;
      }

      const decompressed = huffmanCoder.decompress(
        compressedData.compressed,
        compressedData.tree,
        compressedData.originalSize,
        compressedData.padding
      );
      
      setDecompressedData(decompressed);
      setProcessingStage('Decompression completed!');
      setProcessingProgress(100);
      
      setTimeout(() => {
        setProcessingStage('');
        setProcessingProgress(0);
      }, 1500);
      
    } catch (error) {
      console.error('Decompression error:', error);
      alert('Error decompressing file. Please try again.');
      setProcessingStage('Decompression failed');
    } finally {
      setIsProcessing(false);
    }
  }, [compressedData]);

  const handleDownload = useCallback((type) => {
    if (type === 'compressed' && compressedData) {
      // Create a file with compression metadata
      const metadata = {
        tree: compressedData.tree,
        originalSize: compressedData.originalSize,
        padding: compressedData.padding,
        originalName: currentFile.name
      };
      
      const metadataStr = JSON.stringify(metadata);
      const metadataBytes = new TextEncoder().encode(metadataStr);
      const metadataLength = new Uint32Array([metadataBytes.length]);
      
      // Combine metadata length, metadata, and compressed data
      const combined = new Uint8Array(
        4 + metadataBytes.length + compressedData.compressed.length
      );
      
      combined.set(new Uint8Array(metadataLength.buffer), 0);
      combined.set(metadataBytes, 4);
      combined.set(compressedData.compressed, 4 + metadataBytes.length);
      
      const fileName = currentFile.name.replace(/\.[^/.]+$/, '.huf');
      downloadFile(combined, fileName, 'application/octet-stream');
    } else if (type === 'decompressed' && decompressedData) {
      const encoder = new TextEncoder();
      const data = encoder.encode(decompressedData);
      downloadFile(data, currentFile.name, 'application/octet-stream');
    }
  }, [compressedData, decompressedData, currentFile]);

  return (
    <div className="App">
      <Header />
      
      <main className="main-content">
        <div className="content-grid">
          <div className="upload-section">
            <FileUploader 
              onFileProcessed={handleFileProcessed}
              isProcessing={isProcessing}
            />
          </div>

          <div className="control-section">
            <ControlPanel
              onCompress={handleCompress}
              onDecompress={handleDecompress}
              onDownload={handleDownload}
              hasFile={!!currentFile}
              hasCompressed={!!compressedData}
              hasDecompressed={!!decompressedData}
              isProcessing={isProcessing}
              fileName={currentFile?.name}
              processingStage={processingStage}
              processingProgress={processingProgress}
            />
          </div>

          {showStats && (
            <div className="stats-section">
              <StatsDisplay 
                stats={stats}
                isVisible={showStats}
              />
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>&copy; 2025 FileCompress Pro. Built with advanced Huffman coding algorithm.</p>
      </footer>
    </div>
  );
}

export default App;