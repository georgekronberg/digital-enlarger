'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const IlfordMultigradeConverter = () => {
  const [image, setImage] = useState(null);
  const [contrastGrade, setContrastGrade] = useState(2);
  const [invertImage, setInvertImage] = useState(true);
  const [brightness, setBrightness] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [imageVisible, setImageVisible] = useState(true);
  const canvasRef = useRef(null);
  const fullScreenRef = useRef(null);
  
  // Approximate Ilford Multigrade filter colors for different grades (RGB values)
  // These are approximations based on Ilford's filter colors
  const gradeColors = {
    0: { r: 50, g: 255, b: 50 },  // Very soft - strong green
    0.5: { r: 70, g: 240, b: 70 },
    1: { r: 90, g: 220, b: 90 },
    1.5: { r: 120, g: 200, b: 120 },
    2: { r: 150, g: 180, b: 150 }, // Normal - balanced
    2.5: { r: 170, g: 160, b: 170 },
    3: { r: 190, g: 140, b: 190 },
    3.5: { r: 210, g: 120, b: 210 },
    4: { r: 230, g: 100, b: 230 },  
    4.5: { r: 240, g: 80, b: 240 },
    5: { r: 255, g: 50, b: 255 }   // High contrast - magenta/blue
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleFullScreen = () => {
    if (!isFullScreen && fullScreenRef.current) {
      if (fullScreenRef.current.requestFullscreen) {
        fullScreenRef.current.requestFullscreen();
      } else if (fullScreenRef.current.mozRequestFullScreen) {
        fullScreenRef.current.mozRequestFullScreen();
      } else if (fullScreenRef.current.webkitRequestFullscreen) {
        fullScreenRef.current.webkitRequestFullscreen();
      } else if (fullScreenRef.current.msRequestFullscreen) {
        fullScreenRef.current.msRequestFullscreen();
      }
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullScreen(false);
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      const isCurrentlyFullScreen = !!(
        document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      );
      
      setIsFullScreen(isCurrentlyFullScreen);
      
      // Reset image visibility when exiting full screen
      if (!isCurrentlyFullScreen) {
        setImageVisible(true);
      } else if (image) {
        // Re-render the image when entering full screen
        setTimeout(() => renderImage(), 100);
      }
    };

    const handleKeyPress = (e) => {
      // Toggle image visibility when spacebar is pressed in full screen mode
      if (isFullScreen && e.code === 'Space') {
        e.preventDefault();
        setImageVisible(prev => !prev);
      }
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('mozfullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
    document.addEventListener('MSFullscreenChange', handleFullScreenChange);
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullScreenChange);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isFullScreen, image]);

  useEffect(() => {
    if (image && canvasRef.current) {
      renderImage();
    }
  }, [image, contrastGrade, invertImage, brightness, showGrid]);
  
  const renderImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match image
    canvas.width = image.width;
    canvas.height = image.height;
    
    // Draw original image
    ctx.drawImage(image, 0, 0);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Get color for selected grade
    const color = gradeColors[contrastGrade];
    
    // Apply color tint and invert if needed
    for (let i = 0; i < data.length; i += 4) {
      // Convert to grayscale first
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      
      let value = gray;
      if (invertImage) {
        value = 255 - value;  // Invert
      }
      
      // Apply brightness adjustment
      value = value * (brightness / 100);
      value = Math.min(255, Math.max(0, value));
      
      // Apply the grade color, preserving luminosity
      data[i] = value * color.r / 255;     // R
      data[i + 1] = value * color.g / 255; // G
      data[i + 2] = value * color.b / 255; // B
    }
    
    // Put the modified image data back
    ctx.putImageData(imageData, 0, 0);
    
    // Draw grid if enabled
    if (showGrid) {
      drawGrid(ctx, canvas.width, canvas.height);
    }
  };
  
  const drawGrid = (ctx, width, height) => {
    const gridSize = 20;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    
    // Draw vertical lines
    for (let x = gridSize; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = gridSize; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  // ShadCN style overrides for dark room mode
  const darkroomStyleOverrides = isFullScreen ? {
    '--custom-red': '#500',
    '--custom-red-hover': '#600',
    '--custom-bg': '#000',
  } : {};

  return (
    <div className="flex flex-col p-4 max-w-4xl mx-auto" style={darkroomStyleOverrides as React.CSSProperties}>
      {isFullScreen ? (
        <div 
          ref={fullScreenRef} 
          className="fixed inset-0 bg-black flex flex-col"
          style={{ backgroundColor: 'var(--custom-bg, #000)', color: 'var(--custom-red, #500)' }}
        >
          <div className="p-4 flex justify-between items-center border-b" style={{ borderColor: 'var(--custom-red, #500)' }}>
            <h2 className="text-xl font-bold" style={{ color: 'var(--custom-red, #500)' }}>Ilford Multigrade Printing Mode</h2>
            <Button 
              onClick={toggleFullScreen} 
              variant="outline"
              style={{ 
                borderColor: 'var(--custom-red, #500)', 
                color: 'var(--custom-red, #500)',
                backgroundColor: 'transparent',
              }}
            >
              Exit Full Screen
            </Button>
          </div>
          
          <div className="flex flex-row p-4 h-full">
            <div className="w-1/3 pr-4 flex flex-col">
              <div className="mb-4">
                <div className="mb-6">
                  <Label 
                    className="mb-2 block"
                    style={{ color: 'var(--custom-red, #500)' }}
                  >
                    Contrast Grade: {contrastGrade}
                  </Label>
                  <div className="py-4">
                    <Slider
                      defaultValue={[2]}
                      min={0}
                      max={5}
                      step={0.5}
                      value={[contrastGrade]}
                      onValueChange={(value) => setContrastGrade(value[0])}
                      style={{ 
                        '--slider-track': 'var(--custom-red, #500)',
                        '--slider-range': 'var(--custom-red, #500)',
                        '--slider-thumb': 'var(--custom-red, #500)',
                      } as React.CSSProperties}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <Label 
                    className="mb-2 block"
                    style={{ color: 'var(--custom-red, #500)' }}
                  >
                    Brightness: {brightness}%
                  </Label>
                  <div className="py-4">
                    <Slider
                      defaultValue={[100]}
                      min={50}
                      max={150}
                      step={1}
                      value={[brightness]}
                      onValueChange={(value) => setBrightness(value[0])}
                      style={{ 
                        '--slider-track': 'var(--custom-red, #500)',
                        '--slider-range': 'var(--custom-red, #500)',
                        '--slider-thumb': 'var(--custom-red, #500)',
                      } as React.CSSProperties}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox 
                    id="fullscreenInvert" 
                    checked={invertImage}
                    onCheckedChange={setInvertImage}
                    style={{ 
                      borderColor: 'var(--custom-red, #500)',
                      backgroundColor: invertImage ? 'var(--custom-red, #500)' : 'transparent'
                    }}
                  />
                  <Label 
                    htmlFor="fullscreenInvert"
                    style={{ color: 'var(--custom-red, #500)' }}
                  >
                    Invert Image
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox 
                    id="fullscreenGrid" 
                    checked={showGrid}
                    onCheckedChange={setShowGrid}
                    style={{ 
                      borderColor: 'var(--custom-red, #500)',
                      backgroundColor: showGrid ? 'var(--custom-red, #500)' : 'transparent'
                    }}
                  />
                  <Label 
                    htmlFor="fullscreenGrid"
                    style={{ color: 'var(--custom-red, #500)' }}
                  >
                    Show Grid
                  </Label>
                </div>
                
                <div className="mt-4">
                  <Label 
                    className="mb-2 block"
                    style={{ color: 'var(--custom-red, #500)' }}
                  >
                    Upload New Image:
                  </Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full border"
                    style={{ 
                      borderColor: 'var(--custom-red, #500)',
                      color: 'var(--custom-red, #500)',
                      backgroundColor: 'transparent'
                    }}
                  />
                </div>
                
                <Button
                  onClick={() => setImageVisible(prev => !prev)}
                  variant="outline"
                  className="mt-6 w-full"
                  style={{ 
                    borderColor: 'var(--custom-red, #500)', 
                    color: 'var(--custom-red, #500)',
                    backgroundColor: 'transparent',
                  }}
                >
                  {imageVisible ? "Hide Image (Spacebar)" : "Show Image (Spacebar)"}
                </Button>
                
                <div className="mt-6 text-sm" style={{ color: 'var(--custom-red, #500)' }}>
                  <p>Press SPACEBAR to toggle image visibility</p>
                  <p>Press ESC to exit full screen</p>
                  <p className="mt-2">All UI elements are dark red to prevent</p>
                  <p>accidental exposure of your photo paper</p>
                </div>
              </div>
            </div>
            
            <div className="w-2/3 flex items-center justify-center">
              {image && (
                <canvas 
                  ref={canvasRef} 
                  className={`max-h-screen max-w-full ${!imageVisible ? 'hidden' : ''}`}
                ></canvas>
              )}
              {(!image || !imageVisible) && (
                <div className="text-center p-8" style={{ color: 'var(--custom-red, #500)' }}>
                  {!image ? "No image loaded" : "Image hidden (press SPACEBAR to show)"}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Ilford Multigrade Digital Enlarger</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Label htmlFor="imageUpload" className="mb-2 block">
                  Upload an image:
                </Label>
                <Input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="mb-6">
                    <Label htmlFor="contrastGrade" className="mb-2 block">
                      Contrast Grade (0-5): {contrastGrade}
                    </Label>
                    <Slider
                      id="contrastGrade"
                      defaultValue={[2]}
                      min={0}
                      max={5}
                      step={0.5}
                      value={[contrastGrade]}
                      onValueChange={(value) => setContrastGrade(value[0])}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <Label htmlFor="brightness" className="mb-2 block">
                      Brightness: {brightness}%
                    </Label>
                    <Slider
                      id="brightness"
                      defaultValue={[100]}
                      min={50}
                      max={150}
                      value={[brightness]}
                      onValueChange={(value) => setBrightness(value[0])}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox 
                      id="invert" 
                      checked={invertImage}
                      onCheckedChange={setInvertImage}
                    />
                    <Label htmlFor="invert">
                      Invert Image (for direct printing)
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox 
                      id="grid" 
                      checked={showGrid}
                      onCheckedChange={setShowGrid}
                    />
                    <Label htmlFor="grid">
                      Show Alignment Grid
                    </Label>
                  </div>
                  
                  <Button
                    onClick={toggleFullScreen}
                    className="w-full mt-4"
                    disabled={!image}
                    variant="default"
                  >
                    Enter Full Screen for Printing
                  </Button>
                  
                  <div className="mt-6 p-4 bg-muted rounded-md">
                    <h3 className="font-bold mb-2">Instructions:</h3>
                    <ol className="list-decimal pl-4 space-y-1">
                      <li>Upload your black and white image</li>
                      <li>Adjust the contrast grade to match your desired Ilford Multigrade filter</li>
                      <li>Keep &quot;Invert Image&quot; checked for direct printing</li>
                      <li>Adjust brightness as needed</li>
                      <li>Enable grid for easier alignment if needed</li>
                      <li>Enter full-screen mode and place photo paper on screen</li>
                      <li>Use spacebar to show/hide the image for exposure</li>
                      <li>Develop normally according to Ilford&apos;s instructions</li>
                    </ol>
                  </div>
                </div>
                
                <div className="bg-black p-2 rounded-md flex items-center justify-center min-h-64" ref={fullScreenRef}>
                  {image ? (
                    <canvas 
                      ref={canvasRef} 
                      className="max-w-full max-h-96 object-contain"
                    ></canvas>
                  ) : (
                    <div className="text-white text-center p-8">
                      Upload an image to preview
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-md mt-6">
                <h3 className="font-bold mb-2">About Ilford Multigrade Papers:</h3>
                <p>Ilford Multigrade papers contain two emulsion layers of different contrast and spectral sensitivity:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>The high-contrast emulsion is sensitive to blue light</li>
                  <li>The low-contrast emulsion is sensitive to green light</li>
                </ul>
                <p className="mt-2">This tool simulates Ilford Multigrade filters by adjusting the color balance toward green (for lower contrast) or blue/magenta (for higher contrast).</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default IlfordMultigradeConverter;