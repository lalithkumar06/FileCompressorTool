import { useState, useRef } from 'react';
import './FileUpload.css';

function FileUpload({ onFileSelect, selectedFile }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file) => {
    const validTypes = ['application/pdf', 'application/octet-stream'];
    const validExtensions = ['.pdf', '.bin'];
    
    const isValidType = validTypes.includes(file.type) || 
                       validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (isValidType) {
      onFileSelect(file);
    } else {
      alert('Please select a PDF file or a compressed (.bin) file');
    }
  };

  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="file-upload-container">
      <div 
        className={`file-upload-area ${isDragging ? 'dragging' : ''} ${selectedFile ? 'has-file' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.bin"
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />
        
        {!selectedFile ? (
          <div className="upload-prompt">
            <div className="upload-icon">📁</div>
            <h3>Drop your file here</h3>
            <p>or click to browse</p>
            <span className="supported-formats">Supported: PDF, BIN (compressed)</span>
          </div>
        ) : (
          <div className="selected-file">
            <div className="file-icon">
              {selectedFile.name.endsWith('.pdf') ? '📄' : '🗜️'}
            </div>
            <div className="file-info">
              <h4>{selectedFile.name}</h4>
              <p>{formatFileSize(selectedFile.size)}</p>
              <span className="file-type">
                {selectedFile.name.endsWith('.pdf') ? 'PDF Document' : 'Compressed File'}
              </span>
            </div>
          </div>
        )}
      </div>
      
      {selectedFile && (
        <button 
          className="change-file-btn"
          onClick={handleClick}
        >
          Change File
        </button>
      )}
    </div>
  );
}

export default FileUpload;