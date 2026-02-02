
export const applyGlitchEffect = async (
    canvas: HTMLCanvasElement,
    imageSrc: string | null,
    username: string
) => {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Configuration
    const SIZE = 500;
    const TEXT_COLOR = '#00ff00';
    const SCANLINE_GAP = 4;

    canvas.width = SIZE;
    canvas.height = SIZE;

    // 1. Draw Base Background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, SIZE, SIZE);

    if (imageSrc) {
        try {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = imageSrc;
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });

            // Crop to Square & Center
            const minDim = Math.min(img.width, img.height);
            const sx = (img.width - minDim) / 2;
            const sy = (img.height - minDim) / 2;

            ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, SIZE, SIZE);
        } catch (e) {
            console.error("Image load failed", e);
            // Fallback placeholder pattern
            ctx.strokeStyle = '#003300';
            for (let i = 0; i < SIZE; i += 20) {
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(SIZE, i);
                ctx.stroke();
            }
        }
    } else {
        // No image placeholder
        ctx.fillStyle = '#001100';
        ctx.fillRect(0, 0, SIZE, SIZE);
        ctx.font = '40px monospace';
        ctx.fillStyle = '#003300';
        ctx.textAlign = 'center';
        ctx.fillText("NO SIGNAL", SIZE / 2, SIZE / 2);
    }

    const imageData = ctx.getImageData(0, 0, SIZE, SIZE);
    const data = imageData.data;

    // 2. High Contrast Grayscale & 3. RGB Shift
    // We'll Create a copy for the shifted channels to read from original
    const originalData = new Uint8ClampedArray(data);



    // Optimized Pass:
    // First, convert everything to high contrast grayscale in a temp buffer
    const grayBuffer = new Uint8ClampedArray(SIZE * SIZE);
    for (let i = 0; i < data.length; i += 4) {
        let val = 0.299 * originalData[i] + 0.587 * originalData[i + 1] + 0.114 * originalData[i + 2];
        val = (val - 128) * 1.5 + 128;
        grayBuffer[i / 4] = Math.max(0, Math.min(255, val));
    }

    // Second Pass: Reconstruct RGB with shifts
    for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
            const idx = (y * SIZE + x) * 4;
            const pixelIdx = y * SIZE + x;

            // Red: Shift Left 5
            const rIdx = (x >= 5) ? pixelIdx - 5 : pixelIdx;
            const rVal = grayBuffer[rIdx];

            // Green: Center
            const gVal = grayBuffer[pixelIdx];

            // Blue: Shift Right 5
            const bIdx = (x < SIZE - 5) ? pixelIdx + 5 : pixelIdx;
            const bVal = grayBuffer[bIdx];

            data[idx] = rVal;
            data[idx + 1] = gVal;
            data[idx + 2] = bVal;
            data[idx + 3] = 255; // Alpha
        }
    }

    // 4. Scanlines
    // Every 4px height, darken the line
    for (let y = 0; y < SIZE; y++) {
        if (y % SCANLINE_GAP === 0) {
            const rowStart = y * SIZE * 4;
            for (let x = 0; x < SIZE * 4; x += 4) {
                data[rowStart + x] *= 0.7; // Darken
                data[rowStart + x + 1] *= 0.7;
                data[rowStart + x + 2] *= 0.7;
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);

    // 5. Signal Corruption (Slices)
    // Randomly pick 3 slices and shift them
    const slices = 3;
    for (let s = 0; s < slices; s++) {
        const sliceHeight = Math.floor(Math.random() * 40) + 10;
        const sliceY = Math.floor(Math.random() * (SIZE - sliceHeight));
        const shift = Math.floor(Math.random() * 40) - 20; // -20 to 20

        // Get slice data
        const slice = ctx.getImageData(0, sliceY, SIZE, sliceHeight);
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, sliceY, SIZE, sliceHeight);
        ctx.putImageData(slice, shift, sliceY);
    }

    // 6. Terminal Overlay
    const fontSize = 24;
    ctx.font = `bold ${fontSize}px "Courier New", monospace`;
    ctx.fillStyle = TEXT_COLOR;
    ctx.shadowColor = TEXT_COLOR;
    ctx.shadowBlur = 4;

    // Bottom Left: Username
    ctx.fillText(username.toUpperCase(), 20, SIZE - 20);

    // Top Right: timestamp/ID
    const idStr = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    ctx.font = `16px "Courier New", monospace`;
    ctx.textAlign = 'right';
    ctx.fillText(`ID:${idStr} // ${timeStr}`, SIZE - 20, 30);

    // Reset
    ctx.shadowBlur = 0;
    ctx.textAlign = 'left';
}
