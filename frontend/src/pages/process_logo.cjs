const { Jimp } = require('jimp');

async function removeBlackBackground() {
  try {
    const imagePath = '../../public/app_logo.png';
    const outputPath = '../../public/app_logo_transparent.png';
    console.log(`Processing image: ${imagePath}`);
    
    // Read the image
    const image = await Jimp.read(imagePath);
    
    // Iterate over all pixels
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      
      // Calculate brightness
      const brightness = (red + green + blue) / 3;
      
      // If the pixel is very dark (black or near-black), make it transparent.
      // We apply a smooth alpha gradient for anti-aliasing near edges.
      if (brightness < 30) {
        this.bitmap.data[idx + 3] = 0; // completely transparent
      } else if (brightness < 60) {
        // Smooth transition
        const alpha = Math.floor((brightness - 30) * (255 / 30));
        this.bitmap.data[idx + 3] = alpha;
      }
      
      // We can also ensure pure black pixels with high red component stay red,
      // but in this logo, the background is pure black or very dark grey.
    });
    
    await image.write(outputPath);
    console.log(`Saved transparent image to: ${outputPath}`);
  } catch (error) {
    console.error('Error processing image:', error);
  }
}

removeBlackBackground();
