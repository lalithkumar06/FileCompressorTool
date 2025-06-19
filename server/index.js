import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { HuffmanCompressor } from './algorithms/huffman.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const uploadsDir = '/tmp';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 
    }
});

const huffmanCompressor = new HuffmanCompressor();

app.post('/api/compress', upload.single('file'), async (req, res) => {
    console.log("request received for compression");
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { algorithm } = req.body;
        const inputPath = req.file.path;
        const fileData = fs.readFileSync(inputPath);
        
        let compressedData;
        let compressionInfo;
        
        const startTime = Date.now();
        
        if (algorithm === 'huffman') {
            const result = huffmanCompressor.compress(fileData);
            compressedData = result.compressed;
            compressionInfo = result.info;
        } 
        
        const compressionTime = Date.now() - startTime;
        
        const compressedFilename = `compressed-${Date.now()}.bin`;
        const compressedPath = path.join(uploadsDir, compressedFilename);
        
        fs.writeFileSync(compressedPath, compressedData);
        
        fs.unlinkSync(inputPath);
        
        res.json({
            success: true,
            filename: compressedFilename,
            originalSize: fileData.length,
            compressedSize: compressedData.length,
            compressionRatio: compressionInfo.compressionRatio,
            compressionTime,
            algorithm: compressionInfo.algorithm || algorithm
        });
        
    } catch (error) {
        console.error('Compression error:', error);
        res.status(500).json({ error: 'Compression failed: ' + error.message });
    }
});

app.post('/api/decompress', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { algorithm, originalFilename } = req.body;
        const inputPath = req.file.path;
        const compressedData = fs.readFileSync(inputPath);
        
        let decompressedData;
        const startTime = Date.now();
        
        if (algorithm === 'huffman') {
            decompressedData = huffmanCompressor.decompress(compressedData);
        }
        
        const decompressionTime = Date.now() - startTime;
        
        const decompressedFilename = `decompressed-${originalFilename || 'file.pdf'}`;
        const decompressedPath = path.join(uploadsDir, decompressedFilename);
        
        fs.writeFileSync(decompressedPath, decompressedData);
        
        fs.unlinkSync(inputPath);
        
        res.json({
            success: true,
            filename: decompressedFilename,
            decompressedSize: decompressedData.length,
            decompressionTime
        });
        
    } catch (error) {
        console.error('Decompression error:', error);
        res.status(500).json({ error: 'Decompression failed: ' + error.message });
    }
});

app.get('/api/download/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(uploadsDir, filename);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        res.download(filePath, (err) => {
            if (err) {
                console.error('Download error:', err);
            } else {
                setTimeout(() => {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                }, 5000);
            }
        });
        
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Download failed' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});