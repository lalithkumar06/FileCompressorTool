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

  push(node) {
    this.heap.push(node);
    this._heapifyUp(this.heap.length - 1);
  }

  pop() {
    const size = this.heap.length;
    if (size === 0) return null;
    if (size === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this._heapifyDown(0);
    return min;
  }

  _heapifyUp(index) {
    let current = index;
    while (current > 0) {
      const parent = (current - 1) >> 1;
      if (this.heap[parent].freq <= this.heap[current].freq) break;
      [this.heap[parent], this.heap[current]] = [
        this.heap[current],
        this.heap[parent],
      ];
      current = parent;
    }
  }

  _heapifyDown(index) {
    const size = this.heap.length;
    let current = index;

    while (true) {
      let smallest = current;
      const left = 2 * current + 1;
      const right = 2 * current + 2;

      if (left < size && this.heap[left].freq < this.heap[smallest].freq)
        smallest = left;
      if (right < size && this.heap[right].freq < this.heap[smallest].freq)
        smallest = right;

      if (smallest === current) break;
      [this.heap[current], this.heap[smallest]] = [
        this.heap[smallest],
        this.heap[current],
      ];
      current = smallest;
    }
  }

  size() {
    return this.heap.length;
  }
}

export class HuffmanCoder {
  constructor() {
    this.codes = {};
    this.reverseMapping = {};
    this.root = null;
  }

  buildFrequencyTable(data) {
    const frequency = Object.create(null);
    for (let i = 0, len = data.length; i < len; i++) {
      const char = data[i];
      frequency[char] = (frequency[char] || 0) + 1;
    }
    return frequency;
  }

  buildHuffmanTree(frequency) {
    const heap = new MinHeap();
    for (const char in frequency)
      heap.push(new HuffmanNode(char, frequency[char]));
    while (heap.size() > 1) {
      const left = heap.pop(),
        right = heap.pop();
      heap.push(new HuffmanNode(null, left.freq + right.freq, left, right));
    }
    return heap.pop();
  }

  generateCodes(node, code = "", codes = this.codes) {
    if (!node) return codes;
    if (node.char !== null) {
      codes[node.char] = code || "0";
      return codes;
    }
    this.generateCodes(node.left, code + "0", codes);
    this.generateCodes(node.right, code + "1", codes);
    return codes;
  }

  compress(data) {
    if (!data || !data.length)
      return { compressed: new Uint8Array(0), tree: null, originalSize: 0 };

    const frequency = this.buildFrequencyTable(data);
    this.root = this.buildHuffmanTree(frequency);
    this.codes = this.generateCodes(this.root);

    this.reverseMapping = {};
    for (const char in this.codes) this.reverseMapping[this.codes[char]] = char;

    let bitStr = "";
    for (let i = 0; i < data.length; i++) bitStr += this.codes[data[i]];

    const padding = (8 - (bitStr.length % 8)) % 8;
    if (padding) bitStr += "0".repeat(padding);

    const bytes = new Uint8Array(bitStr.length >> 3);
    for (let i = 0; i < bytes.length; i++)
      bytes[i] = parseInt(bitStr.substr(i << 3, 8), 2);

    return {
      compressed: bytes,
      tree: this.serializeTree(this.root),
      originalSize: data.length,
      padding,
    };
  }

  decompress(compressedData, tree, originalSize, padding = 0) {
    if (!compressedData || !compressedData.length) return "";

    this.root = this.deserializeTree(tree);

    let bitStr = "";
    for (let i = 0; i < compressedData.length; i++)
      bitStr += compressedData[i].toString(2).padStart(8, "0");

    if (padding) bitStr = bitStr.slice(0, -padding);

    let decoded = "",
      node = this.root;
    for (let i = 0; i < bitStr.length; i++) {
      node = bitStr[i] === "0" ? node.left : node.right;
      if (node.char !== null) {
        decoded += node.char;
        if (decoded.length === originalSize) break;
        node = this.root;
      }
    }
    return decoded;
  }

  

  serializeTree(node) {
    if (!node) return null;
    if (node.char !== null) return { char: node.char, freq: node.freq };
    return {
      char: null,
      freq: node.freq,
      left: this.serializeTree(node.left),
      right: this.serializeTree(node.right),
    };
  }

  deserializeTree(data) {
    if (!data) return null;
    const node = new HuffmanNode(data.char, data.freq);
    if (data.left) node.left = this.deserializeTree(data.left);
    if (data.right) node.right = this.deserializeTree(data.right);
    return node;
  }

  getCompressionRatio(originalSize, compressedSize) {
    return originalSize
      ? (((originalSize - compressedSize) / originalSize) * 100).toFixed(2)
      : 0;
  }

  getStats(originalData, compressedData) {
    const originalSize = originalData.length;
    const compressedSize = compressedData.length;
    const ratio = this.getCompressionRatio(originalSize, compressedSize);
    return {
      originalSize,
      compressedSize,
      ratio: parseFloat(ratio),
      spaceSaved: originalSize - compressedSize,
      efficiency: ratio > 0 ? "Good" : "Poor",
    };
  }
}

export const processFileInChunks = async (
  file,
  chunkSize = 1024 * 1024,
  onProgress
) => {
  const decoder = new TextDecoder();
  const totalChunks = Math.ceil(file.size / chunkSize);
  let result = "";
  for (let i = 0; i < totalChunks; i++) {
    const chunk = file.slice(
      i * chunkSize,
      Math.min((i + 1) * chunkSize, file.size)
    );
    const arrayBuffer = await chunk.arrayBuffer();
    result += decoder.decode(new Uint8Array(arrayBuffer));
    if (onProgress) onProgress(((i + 1) / totalChunks) * 100);
  }
  return result;
};

export const downloadFile = (
  data,
  filename,
  mimeType = "application/octet-stream"
) => {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
