// compression-worker.js - Web Worker for non-blocking compression
// This should be placed in the public folder as /compression-worker.js

importScripts("./algorithms/huffman.js");

class CompressionWorker {
  constructor() {
    this.compressor = new OptimizedHuffmanCompressor();
  }

  async handleMessage(event) {
    const { type, data, options = {} } = event.data;

    try {
      switch (type) {
        case "compress":
          await this.compressData(data, options);
          break;

        case "decompress":
          await this.decompressData(data, options);
          break;

        default:
          throw new Error(`Unknown message type: ${type}`);
      }
    } catch (error) {
      postMessage({
        type: "error",
        error: error.message,
      });
    }
  }

  async compressData(data, options) {
    const startTime = performance.now();

    // Use the optimized compressor with progress reporting
    const result = await this.compressor.compress(data, {
      ...options,
      reportProgress: true,
    });

    const endTime = performance.now();

    postMessage({
      type: "complete",
      data: {
        compressed: result.compressed,
        info: {
          ...result.info,
          processingTime: endTime - startTime,
        },
      },
    });
  }

  async decompressData(data, options) {
    const startTime = performance.now();

    const decompressed = await this.compressor.decompress(data, {
      ...options,
      reportProgress: true,
    });

    const endTime = performance.now();

    postMessage({
      type: "complete",
      data: {
        decompressed,
        info: {
          decompressedSize: decompressed.length,
          processingTime: endTime - startTime,
        },
      },
    });
  }
}

// Initialize worker
const worker = new CompressionWorker();

// Handle messages
self.onmessage = (event) => {
  worker.handleMessage(event);
};

// Handle errors
self.onerror = (error) => {
  postMessage({
    type: "error",
    error: error.message,
  });
};

// Alternative implementation without class for broader compatibility
/*
// Simple function-based implementation
importScripts('./OptimizedHuffman.js');

const compressor = new OptimizedHuffmanCompressor();

self.onmessage = async (event) => {
    const { type, data, options = {} } = event.data;
    
    try {
        if (type === 'compress') {
            const startTime = performance.now();
            const result = await compressor.compress(data, { ...options, reportProgress: true });
            const endTime = performance.now();
            
            postMessage({
                type: 'complete',
                data: {
                    compressed: result.compressed,
                    info: {
                        ...result.info,
                        processingTime: endTime - startTime
                    }
                }
            });
            
        } else if (type === 'decompress') {
            const startTime = performance.now();
            const decompressed = await compressor.decompress(data, { ...options, reportProgress: true });
            const endTime = performance.now();
            
            postMessage({
                type: 'complete',
                data: {
                    decompressed,
                    info: {
                        decompressedSize: decompressed.length,
                        processingTime: endTime - startTime
                    }
                }
            });
        }
    } catch (error) {
        postMessage({
            type: 'error',
            error: error.message
        });
    }
};
*/
