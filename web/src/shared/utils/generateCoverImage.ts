export const generateCoverImage = (title: string, author: string): string => {
  // Create a canvas element
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set canvas dimensions
  canvas.width = 400;
  canvas.height = 600;
  
  if (ctx) {
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#4A90E2');
    gradient.addColorStop(1, '#357ABD');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add some design elements
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 100 + i * 100);
      ctx.lineTo(canvas.width, 100 + i * 100);
      ctx.stroke();
    }
    
    // Title text
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Wrap title text
    const wrapText = (text: string, maxWidth: number) => {
      const words = text.split(' ');
      const lines = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + ' ' + word).width;
        if (width < maxWidth) {
          currentLine += ' ' + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
      return lines;
    };

    // Draw title
    ctx.font = 'bold 32px Arial';
    const titleLines = wrapText(title, canvas.width - 40);
    titleLines.forEach((line, index) => {
      ctx.fillText(
        line,
        canvas.width / 2,
        canvas.height / 2 - (titleLines.length - 1) * 20 + index * 40
      );
    });
    
    // Draw author
    ctx.font = '24px Arial';
    ctx.fillText(
      author,
      canvas.width / 2,
      canvas.height / 2 + titleLines.length * 20 + 40
    );
  }
  
  return canvas.toDataURL('image/jpeg');
};