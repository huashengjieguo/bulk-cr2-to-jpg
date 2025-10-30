let selectedFiles = [];
let convertedFiles = [];
let isConverting = false;

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const addMoreFiles = document.getElementById('addMoreFiles');
    const uploadArea = document.getElementById('uploadArea');
    
    fileInput.addEventListener('change', handleFileSelect);
    addMoreFiles.addEventListener('change', handleFileSelect);
    
    // Drag and drop functionality
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // Add click handler for "Add More Files" button
    const addMoreButton = document.getElementById('addMoreLabel');
    if (addMoreButton) {
        addMoreButton.addEventListener('click', () => {
            addMoreFiles.click();
        });
    }
});

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-active');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-active');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-active');
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
        file.name.toLowerCase().endsWith('.cr2')
    );
    
    if (files.length > 0) {
        addFiles(files);
    }
}

function handleFileSelect(event) {
    const files = Array.from(event.target.files).filter(file => 
        file.name.toLowerCase().endsWith('.cr2')
    );
    
    if (files.length > 0) {
        addFiles(files);
    }
}

function addFiles(files) {
    // If we have converted files, reset to allow new files
    if (convertedFiles.length > 0) {
        convertedFiles = [];
        document.getElementById('listTitle').textContent = 'Selected Files';
        
        // Reset convert button text
        const convertBtn = document.getElementById('convertBtn');
        if (convertBtn) {
            convertBtn.textContent = 'Convert to JPG';
            convertBtn.disabled = false;
        }
    }
    
    selectedFiles = [...selectedFiles, ...files];
    updateFileList();
    showFileList();
}

function updateFileList() {
    const container = document.getElementById('filesContainer');
    container.innerHTML = '';
    
    const filesToShow = convertedFiles.length > 0 ? convertedFiles : selectedFiles;
    
    filesToShow.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'flex items-center justify-between p-4 bg-muted-50 rounded-lg';
        
        const fileName = 'name' in file ? file.name : file.name;
        const fileSize = 'size' in file ? file.size : file.size;
        
        fileItem.innerHTML = `
            <div class="flex items-center gap-3 flex-1 min-w-0">
                <svg class="w-5 h-5 text-muted-foreground flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium truncate">${fileName}</p>
                    <p class="text-xs text-muted-foreground">${formatFileSize(fileSize)}</p>
                </div>
            </div>
            ${convertedFiles.length > 0 ? 
                `<button class="btn btn-outline btn-sm" onclick="downloadFile(${index})">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Download
                </button>` :
                `<button class="btn btn-ghost btn-sm" onclick="removeFile(${index})">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>`
            }
        `;
        
        container.appendChild(fileItem);
    });
    
    // Add Download All button if there are converted files
    if (convertedFiles.length > 0) {
        const downloadAllContainer = document.createElement('div');
        downloadAllContainer.className = 'mt-4 pt-4 border-t border-border';
        downloadAllContainer.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium">All Converted Files</p>
                    <p class="text-xs text-muted-foreground">${convertedFiles.length} files ready for download</p>
                </div>
                <button class="btn btn-primary" onclick="downloadAll()">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Download All as ZIP
                </button>
            </div>
        `;
        container.appendChild(downloadAllContainer);
    }
}

function showFileList() {
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('fileList').style.display = 'block';
}

function hideFileList() {
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('fileList').style.display = 'none';
}

function removeFile(index) {
    selectedFiles.splice(index, 1);
    if (selectedFiles.length === 0) {
        hideFileList();
    } else {
        updateFileList();
    }
}

function resetFiles() {
    selectedFiles = [];
    convertedFiles = [];
    hideFileList();
    document.getElementById('progressContainer').style.display = 'none';
}

async function convertFiles() {
    if (isConverting || selectedFiles.length === 0) return;
    
    isConverting = true;
    convertedFiles = [];
    document.getElementById('progressContainer').style.display = 'block';
    document.getElementById('convertBtn').disabled = true;
    document.getElementById('convertBtn').textContent = 'Converting...';
    
    for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const progress = ((i + 1) / selectedFiles.length) * 100;
        
        document.getElementById('progressText').textContent = Math.round(progress) + '%';
        document.getElementById('progressBar').style.width = progress + '%';
        
        try {
            const result = await convertFile(file);
            if (result.success) {
                convertedFiles.push({
                    name: file.name.replace(/\.cr2$/i, '.jpg'),
                    url: result.url,
                    size: result.size
                });
            }
        } catch (error) {
            console.error('Conversion error:', error);
        }
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    isConverting = false;
    document.getElementById('convertBtn').disabled = false;
    document.getElementById('convertBtn').textContent = 'Convert to JPG';
    document.getElementById('progressContainer').style.display = 'none';
    document.getElementById('listTitle').textContent = 'Converted Files';
    
    // Show "Add More Files" button after conversion
    const addMoreLabel = document.getElementById('addMoreLabel');
    if (addMoreLabel) {
        addMoreLabel.style.display = 'block';
    }
    
    updateFileList();
}

function convertFile(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const buffer = e.target.result;
                const result = extractEmbeddedJpeg(buffer);

                if (result.success) {
                    const jpgBlob = new Blob([result.data], { type: 'image/jpeg' });
                    const jpgUrl = URL.createObjectURL(jpgBlob);
                    
                    resolve({
                        success: true,
                        url: jpgUrl,
                        size: jpgBlob.size
                    });
                } else {
                    resolve({ success: false, error: result.message });
                }
            } catch (error) {
                resolve({ success: false, error: error.message });
            }
        };

        reader.onerror = function() {
            resolve({ success: false, error: 'File read error' });
        };

        reader.readAsArrayBuffer(file.slice(0, 1024 * 1024));
    });
}

function downloadFile(index) {
    const file = convertedFiles[index];
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
}

async function downloadAll() {
    if (convertedFiles.length === 0) return;
    
    try {
        const zip = new JSZip();
        
        // Add all converted files to the ZIP
        convertedFiles.forEach((file, index) => {
            const fileName = file.name.replace('.cr2', '.jpg');
            zip.file(fileName, file.data);
        });
        
        // Generate ZIP file
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        
        // Create download link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipBlob);
        link.download = `converted-cr2-files-${new Date().toISOString().slice(0, 10)}.zip`;
        link.click();
        
        // Clean up
        URL.revokeObjectURL(link.href);
        
    } catch (error) {
        console.error('Error creating ZIP file:', error);
        alert('Error creating ZIP file. Please try downloading files individually.');
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Attempts to locate and extract embedded JPG thumbnail from CR2 file's ArrayBuffer.
 * Note: This is a simplified heuristic approach, not a complete TIFF/CR2 parser.
 *
 * @param {ArrayBuffer} buffer File data as ArrayBuffer
 * @returns {{success: boolean, data?: Uint8Array, message?: string}} Result object
 */
function extractEmbeddedJpeg(buffer) {
    // CR2 is based on TIFF format, thumbnail info is usually in the IFD (Image File Directory) at file header.
    // For simplification, we use a more general approach: find JPG file start marker (SOI: Start of Image).
    // JPG file start marker is FF D8.
    
    const dataView = new DataView(buffer);
    const dataArray = new Uint8Array(buffer);
    const soiMarker = [0xFF, 0xD8]; // Start of Image marker for JPEG
    const eoiMarker = [0xFF, 0xD9]; // End of Image marker for JPEG

    let startOffset = -1;
    let endOffset = -1;

    // 1. Find JPG start marker (FF D8)
    for (let i = 0; i < dataArray.length - 1; i++) {
        if (dataArray[i] === soiMarker[0] && dataArray[i + 1] === soiMarker[1]) {
            startOffset = i;
            break;
        }
    }

    if (startOffset === -1) {
        return { success: false, message: "JPG start marker (FF D8) not found." };
    }

    // 2. Find JPG end marker (FF D9) after start marker
    // Embedded JPG can be long, so we find the first end marker
    for (let i = startOffset + 2; i < dataArray.length - 1; i++) {
         if (dataArray[i] === eoiMarker[0] && dataArray[i + 1] === eoiMarker[1]) {
            // Include EOI marker, so length is to i+2
            endOffset = i + 2; 
            break;
        }
    }

    if (endOffset === -1) {
        return { success: false, message: "Found JPG start marker but not end marker (FF D9). File may be truncated or too large." };
    }

    // 3. Extract JPG data
    const jpgData = dataArray.subarray(startOffset, endOffset);

    if (jpgData.length < 100) {
         return { success: false, message: "Extracted data too small, may not be valid JPG." };
    }

    return { success: true, data: jpgData };
}
