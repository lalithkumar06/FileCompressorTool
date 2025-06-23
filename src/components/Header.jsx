const Header = () => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-section">
          <div className="logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15l-6-6v4.5c0 .83-.67 1.5-1.5 1.5h-7c-.83 0-1.5.67-1.5 1.5v1c0 .83.67 1.5 1.5 1.5h7c.83 0 1.5.67 1.5 1.5V21l6-6z"/>
              <circle cx="12" cy="12" r="1"/>
            </svg>
          </div>
          <div className="logo-text">
            <h1>FileCompress Pro</h1>
            <p>Advanced Huffman Compression</p>
          </div>
        </div>
        
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-value">500MB+</span>
            <span className="stat-label">Max File Size</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">Lossless</span>
            <span className="stat-label">Compression</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">Instant</span>
            <span className="stat-label">Processing</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;