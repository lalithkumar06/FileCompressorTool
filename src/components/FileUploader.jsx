import { useState, useRef, useCallback } from 'react';
import { processFileInChunks } from '../utils/huffman.js';

const FileUploader = ({ onFileProcessed, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = useCallback(async (files) => {
    if (files && files.length > 0) {
      const file = files[0];
      setIsUploading(true);
      setUploadProgress(0);
      setUploadStage('Preparing file...');
      
      try {
        // Simulate upload stages
        const stages = [
          { name: 'Preparing file...', progress: 10 },
          { name: 'Reading file data...', progress: 30 },
          { name: 'Processing chunks...', progress: 70 },
          { name: 'Finalizing upload...', progress: 90 },
          { name: 'Upload complete!', progress: 100 }
        ];

        for (let i = 0; i < stages.length - 1; i++) {
          const stage = stages[i];
          setUploadStage(stage.name);
          
          // Animate progress to stage target
          const startProgress = i === 0 ? 0 : stages[i - 1].progress;
          const targetProgress = stage.progress;
          const steps = 20;
          const progressStep = (targetProgress - startProgress) / steps;
          
          for (let step = 0; step <= steps; step++) {
            setUploadProgress(startProgress + (progressStep * step));
            await new Promise(resolve => setTimeout(resolve, 30));
          }
        }

        // Process the actual file
        setUploadStage('Processing chunks...');
        const fileData = await processFileInChunks(
          file, 
          1024 * 1024, // 1MB chunks
          (chunkProgress) => {
            const baseProgress = 70;
            const chunkProgressRange = 20;
            setUploadProgress(baseProgress + (chunkProgress / 100) * chunkProgressRange);
          }
        );
        
        // Final stage
        setUploadStage('Upload complete!');
        setUploadProgress(100);
        
        onFileProcessed({
          name: file.name,
          size: file.size,
          type: file.type,
          data: fileData
        });

        // Clear upload state after delay
        setTimeout(() => {
          setUploadStage('');
          setUploadProgress(0);
        }, 1500);
        
      } catch (error) {
        console.error('Error processing file:', error);
        alert('Error processing file. Please try again.');
        setUploadStage('Upload failed');
      } finally {
        setIsUploading(false);
      }
    }
  }, [onFileProcessed]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleChange = useCallback((e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const onButtonClick = () => {
    if (!isUploading && !isProcessing) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="file-uploader">
      <div
        className={`upload-zone ${dragActive ? 'drag-active' : ''} ${(isUploading || isProcessing) ? 'processing' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="file-input"
          onChange={handleChange}
          accept="*/*"
          disabled={isUploading || isProcessing}
        />
        
        <div className="upload-content">
          {(isUploading || isProcessing) ? (
            <div className="processing-indicator">
              <div className="spinner"></div>
              <p>{uploadStage || 'Processing...'}</p>
              {(uploadProgress > 0 || isProcessing) && (
                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">
                    {uploadProgress > 0 ? `${uploadProgress.toFixed(1)}%` : 'Processing...'}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="upload-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </div>
              <h3>Drop your file here</h3>
              <p>or click to browse</p>
              <div className="file-info">
                <span>Supports files up to 500MB</span>
                <span>All file types supported</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploader;