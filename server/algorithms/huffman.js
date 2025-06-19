class HuffmanNode {
    constructor(char, freq, left = null, right = null) {
        this.char = char;
        this.freq = freq;
        this.left = left;
        this.right = right;
    }
}

class MinHeap {
    constructor() {
        this.heap = [];
    }
    
    insert(node) {
        this.heap.push(node);
        this.heapifyUp();
    }
    
    extractMin() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop();
        
        const min = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.heapifyDown();
        return min;
    }
    
    heapifyUp() {
        let index = this.heap.length - 1;
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[parentIndex].freq <= this.heap[index].freq) break;
            
            [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
            index = parentIndex;
        }
    }
    
    heapifyDown() {
        let index = 0;
        while (true) {
            let minIndex = index;
            const leftChild = 2 * index + 1;
            const rightChild = 2 * index + 2;
            
            if (leftChild < this.heap.length && this.heap[leftChild].freq < this.heap[minIndex].freq) {
                minIndex = leftChild;
            }
            
            if (rightChild < this.heap.length && this.heap[rightChild].freq < this.heap[minIndex].freq) {
                minIndex = rightChild;
            }
            
            if (minIndex === index) break;
            
            [this.heap[index], this.heap[minIndex]] = [this.heap[minIndex], this.heap[index]];
            index = minIndex;
        }
    }
    
    size() {
        return this.heap.length;
    }
}

export class HuffmanCompressor {
    buildFrequencyTable(data) {
        const freq = {};
        for (let i = 0; i < data.length; i++) {
            const byte = data[i];
            freq[byte] = (freq[byte] || 0) + 1;
        }
        return freq;
    }
    
    buildHuffmanTree(freq) {
        const heap = new MinHeap();
        
        // Create leaf nodes for each character
        for (const [char, frequency] of Object.entries(freq)) {
            heap.insert(new HuffmanNode(parseInt(char), frequency));
        }
        
        // Build the tree
        while (heap.size() > 1) {
            const left = heap.extractMin();
            const right = heap.extractMin();
            const merged = new HuffmanNode(null, left.freq + right.freq, left, right);
            heap.insert(merged);
        }
        
        return heap.extractMin();
    }
    
    buildCodes(root) {
        if (!root) return {};
        
        const codes = {};
        
        const traverse = (node, code) => {
            if (node.char !== null) {
                codes[node.char] = code || '0'; // Handle single character case
                return;
            }
            
            if (node.left) traverse(node.left, code + '0');
            if (node.right) traverse(node.right, code + '1');
        };
        
        traverse(root, '');
        return codes;
    }
    
    compress(data) {
        if (data.length === 0) {
            return { compressed: new Uint8Array(0), info: { originalSize: 0, compressedSize: 0, compressionRatio: '0.00' } };
        }
        
        // Build frequency table
        const freq = this.buildFrequencyTable(data);
        
        // Handle single character case
        if (Object.keys(freq).length === 1) {
            const char = Object.keys(freq)[0];
            const count = freq[char];
            const header = this.serializeTree({ char: parseInt(char), freq: count, left: null, right: null });
            const compressed = new Uint8Array(header.length + 4);
            compressed.set(header);
            // Store count as 4 bytes
            const countBytes = new ArrayBuffer(4);
            new DataView(countBytes).setUint32(0, count, true);
            compressed.set(new Uint8Array(countBytes), header.length);
            
            return {
                compressed,
                info: {
                    originalSize: data.length,
                    compressedSize: compressed.length,
                    compressionRatio: ((data.length - compressed.length) / data.length * 100).toFixed(2)
                }
            };
        }
        
        // Build Huffman tree
        const root = this.buildHuffmanTree(freq);
        
        // Build codes
        const codes = this.buildCodes(root);
        
        // Encode data
        let encodedBits = '';
        for (let i = 0; i < data.length; i++) {
            encodedBits += codes[data[i]];
        }
        
        // Convert bits to bytes
        const paddingBits = 8 - (encodedBits.length % 8);
        if (paddingBits !== 8) {
            encodedBits += '0'.repeat(paddingBits);
        }
        
        const encodedBytes = new Uint8Array(encodedBits.length / 8);
        for (let i = 0; i < encodedBits.length; i += 8) {
            const byte = encodedBits.slice(i, i + 8);
            encodedBytes[i / 8] = parseInt(byte, 2);
        }
        
        // Serialize tree and create final compressed data
        const treeData = this.serializeTree(root);
        const compressed = new Uint8Array(treeData.length + encodedBytes.length + 1);
        compressed.set(treeData);
        compressed.set(encodedBytes, treeData.length);
        compressed[compressed.length - 1] = paddingBits === 8 ? 0 : paddingBits;
        
        return {
            compressed,
            info: {
                originalSize: data.length,
                compressedSize: compressed.length,
                compressionRatio: ((data.length - compressed.length) / data.length * 100).toFixed(2)
            }
        };
    }
    
    decompress(compressedData) {
        if (compressedData.length === 0) {
            return new Uint8Array(0);
        }
        
        // Deserialize tree
        const { tree, offset } = this.deserializeTree(compressedData, 0);
        
        // Handle single character case
        if (tree.char !== null) {
            const countBytes = compressedData.slice(offset, offset + 4);
            const count = new DataView(countBytes.buffer.slice(countBytes.byteOffset, countBytes.byteOffset + 4)).getUint32(0, true);
            return new Uint8Array(count).fill(tree.char);
        }
        
        const paddingBits = compressedData[compressedData.length - 1];
        const encodedBytes = compressedData.slice(offset, -1);
        
        // Convert bytes to bits
        let encodedBits = '';
        for (let i = 0; i < encodedBytes.length; i++) {
            encodedBits += encodedBytes[i].toString(2).padStart(8, '0');
        }
        
        // Remove padding
        if (paddingBits > 0) {
            encodedBits = encodedBits.slice(0, -paddingBits);
        }
        
        // Decode using tree
        const decoded = [];
        let currentNode = tree;
        
        for (let i = 0; i < encodedBits.length; i++) {
            const bit = encodedBits[i];
            currentNode = bit === '0' ? currentNode.left : currentNode.right;
            
            if (currentNode.char !== null) {
                decoded.push(currentNode.char);
                currentNode = tree;
            }
        }
        
        return new Uint8Array(decoded);
    }
    
    serializeTree(node) {
        const result = [];
        
        const serialize = (n) => {
            if (n.char !== null) {
                result.push(1); // Leaf node marker
                result.push(n.char);
            } else {
                result.push(0); // Internal node marker
                serialize(n.left);
                serialize(n.right);
            }
        };
        
        serialize(node);
        return new Uint8Array(result);
    }
    
    deserializeTree(data, offset) {
        const deserialize = (pos) => {
            if (data[pos[0]] === 1) {
                // Leaf node
                pos[0]++;
                const char = data[pos[0]];
                pos[0]++;
                return { char, freq: 0, left: null, right: null };
            } else {
                // Internal node
                pos[0]++;
                const left = deserialize(pos);
                const right = deserialize(pos);
                return { char: null, freq: 0, left, right };
            }
        };
        
        const pos = [offset];
        const tree = deserialize(pos);
        return { tree, offset: pos[0] };
    }
}