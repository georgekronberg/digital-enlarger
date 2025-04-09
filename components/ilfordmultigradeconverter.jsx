'use client';

import React, {useState, useRef, useEffect} from 'react';
import {Slider} from "@/components/ui/slider";
import {Checkbox} from "@/components/ui/checkbox";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";

// First, let's define an enum for our exposure states
const ExposureState = {
    NORMAL: 0,      // UI + image with filters
    ALIGN: 1,       // UI + image with red filter
    HIDDEN: 2,      // UI only
    EXPOSE: 3,      // Image with filters only
    BLANK: 4        // Nothing
};

const Controls = ({isFullScreen, exposureState, ...props}) => {
    // Add state for exposure time
    const [exposureTime, setExposureTime] = useState('');
    // Add ref for timer
    const timerRef = useRef(null);
    // Add test strip mode state
    const [testStripMode, setTestStripMode] = useState(props.testStripMode);
    // Number of strips for test strip mode
    const TOTAL_STRIPS = 5;
    // Add current strip state
    const [currentStrip, setCurrentStrip] = useState(0);



    // Update the darkroomSliderStyles object
    const darkroomSliderStyles = isFullScreen ? {
        '--slider-track': 'var(--custom-red, #500)',
        '--slider-range': 'var(--custom-red, #500)',
        '--slider-thumb': 'var(--custom-red, #500)',
        '--slider-thumb-size': '16px',
        '--slider-background': 'var(--custom-red, #500)',
    } : {};

    // Handle exposure timer
    useEffect(() => {
        // When entering EXPOSE state and we have an exposure time, start the timer
        if (exposureState === ExposureState.EXPOSE && exposureTime && !isNaN(Number(exposureTime))) {
            // Clear any existing timer
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            if (testStripMode) {
                // For test strip mode, we expose each strip for the set time
                // and then move to the next strip
                if (currentStrip < TOTAL_STRIPS) {
                    timerRef.current = setTimeout(() => {
                        // Move to the next strip
                        setCurrentStrip(prev => prev + 1);

                        // If we've finished all strips, end the exposure
                        if (currentStrip >= TOTAL_STRIPS - 1) {
                            props.setExposureState(ExposureState.BLANK);
                            setCurrentStrip(0); // Reset for next time
                        }
                    }, Number(exposureTime) * 1000); // Convert seconds to milliseconds
                }
            } else {
                // Normal exposure mode - just set timer for the full exposure
                timerRef.current = setTimeout(() => {
                    // Call the state change function to switch to BLANK state
                    props.setExposureState(ExposureState.BLANK);
                }, Number(exposureTime) * 1000); // Convert seconds to milliseconds
            }

        }

        // Cleanup function to clear the timer if component unmounts or state changes
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [exposureState, exposureTime, props, testStripMode, currentStrip]);

    useEffect(() => {
        if (props.onStripChange) {
            console.log("pushing current strip to the parent", currentStrip, TOTAL_STRIPS, testStripMode)
            props.onStripChange(currentStrip, TOTAL_STRIPS, testStripMode);
        }
    }, [currentStrip, testStripMode, props]);


    const getStateMessage = () => {
        switch (exposureState) {
            case ExposureState.NORMAL:
                return "Press SPACEBAR to enter alignment mode";
            case ExposureState.ALIGN:
                return "Align paper with red image, press SPACEBAR to hide image";
            case ExposureState.HIDDEN:
                return "Press SPACEBAR to begin exposure";
            case ExposureState.EXPOSE:
                if (testStripMode) {
                    return `Exposing strip ${currentStrip + 1}/${TOTAL_STRIPS}... ${exposureTime ? `${exposureTime}s per strip` : ''}`;
                } else {
                    return `Exposing... ${exposureTime ? `Auto-blanking in ${exposureTime}s` : 'Press SPACEBAR when done'}`;
                }
            case ExposureState.BLANK:
                return "Press SPACEBAR to restart cycle";
            default:
                return "";
        }
    };


    return (
        <div
            className={isFullScreen ? "w-1/3 pr-4 flex flex-col [&_button]:cursor-[var(--cursor-pointer)] [&_input]:cursor-[var(--cursor-pointer)] [&_[role=slider]]:cursor-[var(--cursor-pointer)]" : "w-full"}>
            <div className="mb-6">
                <Label
                    className="mb-2 block"
                    style={isFullScreen ? {
                        color: 'var(--custom-red, #500)',
                        cursor: 'var(--cursor-pointer)'
                    } : {color: 'var(--text-primary)'}}
                >
                    Contrast Grade: <span
                    style={isFullScreen ? {cursor: 'var(--cursor-pointer)'} : {}}>{props.contrastGrade}</span>
                </Label>
                <div className="py-4">
                    <Slider
                        defaultValue={[2]}
                        min={0}
                        max={5}
                        step={0.5}
                        value={[props.contrastGrade]}
                        onValueChange={(value) => props.setContrastGrade(value[0])}
                        className={`w-full ${isFullScreen ? `
              [&_[role=slider]]:bg-[var(--custom-red)] 
              [&_[role=slider]]:border-[var(--custom-red)] 
              [&_[role=slider]]:hover:bg-[var(--custom-red-hover)] 
              [&_[role=slider]]:focus:ring-[var(--custom-red)] 
              [&_[role=slider]]:focus-visible:outline-none 
              [&_[role=slider]]:focus-visible:ring-[var(--custom-red)] 
              [&_[role=slider]]:focus-visible:ring-1 
              [&_[role=slider]]:shadow-none 
              [&_.range]:bg-[var(--custom-red)]
              [&_[data-disabled]]:opacity-50
              [&_[data-orientation=horizontal]]:h-2
              [&_[data-orientation=horizontal]]:bg-[var(--custom-red)]
              [&_[data-orientation=horizontal]]:opacity-30
              [&_[role=slider]]:w-4
              [&_[role=slider]]:h-4
              [&_[role=slider]]:mt-[-6px]
              [&_.range]:opacity-100
              [&_[role=slider]]:hover:cursor-[var(--cursor-pointer)]
              [&_[role=slider]]:cursor-[var(--cursor-pointer)]
            ` : ''}`}
                        style={isFullScreen ? {
                            ...darkroomSliderStyles,
                            cursor: 'var(--cursor-pointer)'
                        } : {}}
                    />
                </div>
            </div>

            <div className="mb-6">
                <Label
                    className="mb-2 block"
                    style={isFullScreen ? {
                        color: 'var(--custom-red, #500)',
                        cursor: 'var(--cursor-pointer)'
                    } : {color: 'var(--text-primary)'}}
                >
                    Brightness: <span
                    style={isFullScreen ? {cursor: 'var(--cursor-pointer)'} : {}}>{props.brightness}%</span>
                </Label>
                <div className="py-4">
                    <Slider
                        defaultValue={[100]}
                        min={50}
                        max={150}
                        step={1}
                        value={[props.brightness]}
                        onValueChange={(value) => props.setBrightness(value[0])}
                        className={`w-full ${isFullScreen ? `
              [&_[role=slider]]:bg-[var(--custom-red)] 
              [&_[role=slider]]:border-[var(--custom-red)] 
              [&_[role=slider]]:hover:bg-[var(--custom-red-hover)] 
              [&_[role=slider]]:focus:ring-[var(--custom-red)] 
              [&_[role=slider]]:focus-visible:outline-none 
              [&_[role=slider]]:focus-visible:ring-[var(--custom-red)] 
              [&_[role=slider]]:focus-visible:ring-1 
              [&_[role=slider]]:shadow-none 
              [&_.range]:bg-[var(--custom-red)]
              [&_[data-disabled]]:opacity-50
              [&_[data-orientation=horizontal]]:h-2
              [&_[data-orientation=horizontal]]:bg-[var(--custom-red)]
              [&_[data-orientation=horizontal]]:opacity-30
              [&_[role=slider]]:w-4
              [&_[role=slider]]:h-4
              [&_[role=slider]]:mt-[-6px]
              [&_.range]:opacity-100
              [&_[role=slider]]:hover:cursor-[var(--cursor-pointer)]
              [&_[role=slider]]:cursor-[var(--cursor-pointer)]
            ` : ''}`}
                        style={isFullScreen ? {
                            ...darkroomSliderStyles,
                            cursor: 'var(--cursor-pointer)'
                        } : {}}
                    />
                </div>
            </div>

            <div className="mb-6">
                <Label
                    className="mb-2 block"
                    style={isFullScreen ? {
                        color: 'var(--custom-red, #500)',
                        cursor: 'var(--cursor-pointer)'
                    } : {color: 'var(--text-primary)'}}
                >
                    Scale: <span style={isFullScreen ? {cursor: 'var(--cursor-pointer)'} : {}}>{props.scale}%</span>
                </Label>
                <div className="py-4">
                    <Slider
                        defaultValue={[100]}
                        min={0}
                        max={100}
                        step={0.1}
                        value={[props.scale]}
                        onValueChange={(value) => props.setScale(value[0])}
                        className={`w-full ${isFullScreen ? `
              [&_[role=slider]]:bg-[var(--custom-red)] 
              [&_[role=slider]]:border-[var(--custom-red)] 
              [&_[role=slider]]:hover:bg-[var(--custom-red-hover)] 
              [&_[role=slider]]:focus:ring-[var(--custom-red)] 
              [&_[role=slider]]:focus-visible:outline-none 
              [&_[role=slider]]:focus-visible:ring-[var(--custom-red)] 
              [&_[role=slider]]:focus-visible:ring-1 
              [&_[role=slider]]:shadow-none 
              [&_.range]:bg-[var(--custom-red)]
              [&_[data-disabled]]:opacity-50
              [&_[data-orientation=horizontal]]:h-2
              [&_[data-orientation=horizontal]]:bg-[var(--custom-red)]
              [&_[data-orientation=horizontal]]:opacity-30
              [&_[role=slider]]:w-4
              [&_[role=slider]]:h-4
              [&_[role=slider]]:mt-[-6px]
              [&_.range]:opacity-100
              [&_[role=slider]]:hover:cursor-[var(--cursor-pointer)]
              [&_[role=slider]]:cursor-[var(--cursor-pointer)]
            ` : ''}`}
                        style={isFullScreen ? {
                            ...darkroomSliderStyles,
                            cursor: 'var(--cursor-pointer)'
                        } : {}}
                    />
                </div>
            </div>


            <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                    id="fullscreenInvert"
                    checked={props.invertImage}
                    onCheckedChange={props.setInvertImage}
                    className={isFullScreen ? `
            border-[var(--custom-red)]
            data-[state=checked]:bg-[var(--custom-red)]
            data-[state=checked]:border-[var(--custom-red)]
            data-[state=checked]:text-[var(--custom-bg)]
          ` : ''}
                    style={isFullScreen ? {
                        borderColor: 'var(--custom-red, #500)',
                        backgroundColor: props.invertImage ? 'var(--custom-red, #500)' : 'transparent'
                    } : {}}
                />
                <Label
                    htmlFor="fullscreenInvert"
                    style={isFullScreen ? {color: 'var(--custom-red, #500)'} : {}}
                >
                    Invert Image
                </Label>
            </div>

            {/* Add Test Strip Mode Checkbox */}
            <div className="mb-4 flex items-center space-x-2">
                <Checkbox
                    id="testStripMode"
                    checked={testStripMode}
                    onCheckedChange={setTestStripMode}
                    className={isFullScreen ? `
            border-[var(--custom-red)]
            data-[state=checked]:bg-[var(--custom-red)]
            data-[state=checked]:border-[var(--custom-red)]
            data-[state=checked]:text-[var(--custom-bg)]
          ` : ''}
                />
                <Label
                    htmlFor="testStripMode"
                    style={isFullScreen ? {
                        color: 'var(--custom-red, #500)',
                        cursor: 'var(--cursor-pointer)'
                    } : {color: 'var(--text-primary)'}}
                >
                    Exposure Test
                </Label>
            </div>


            {exposureState === ExposureState.ALIGN && (
                <div className="mb-6">
                    <Label
                        className="mb-2 block"
                        style={isFullScreen ? {
                            color: 'var(--custom-red, #500)',
                            cursor: 'var(--cursor-pointer)'
                        } : {color: 'var(--text-primary)'}}
                    >
                        Exposure Time (seconds):
                    </Label>
                    <Input
                        type="number"
                        value={exposureTime}
                        onChange={(e) => setExposureTime(e.target.value)}
                        min="0"
                        step="0.1"
                        placeholder="Enter seconds"
                        className={isFullScreen ? `
                                  bg-transparent 
                                  border-[var(--custom-red)] 
                                  text-[var(--custom-red)]
                                  focus:ring-[var(--custom-red)]
                                  focus:border-[var(--custom-red)]
                                  focus-visible:outline-none
                                  focus-visible:ring-[var(--custom-red)]
                                  focus-visible:ring-1
                                  placeholder:text-[var(--custom-red)]
                                  placeholder:opacity-70
                                ` : ""}
                    />
                </div>
            )}


            {/* Only show file upload in non-fullscreen mode */}
            {!isFullScreen && (
                <div className="mt-4">
                    <Label
                        className="mb-2 block"
                        style={{color: 'var(--text-primary)'}}
                    >
                        Upload New Image:
                    </Label>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            className="relative hover:bg-[var(--button-hover)]"
                            onClick={(e) => {
                                e.stopPropagation();
                                const fileInput = document.getElementById('file-upload-input');
                                if (fileInput) {
                                    fileInput.click();
                                }
                            }}
                            style={{
                                backgroundColor: 'var(--button-bg)',
                                borderColor: 'var(--button-border)',
                                color: 'var(--text-primary)'
                            }}
                        >
                            Choose Image File
                        </Button>

                        <Input
                            id="file-upload-input"
                            type="file"
                            accept="image/*"
                            onChange={props.handleImageUpload}
                            className="hidden"
                        />
                    </div>
                </div>
            )}

            <div className="mt-6 text-sm" style={isFullScreen ? {color: 'var(--custom-red, #500)'} : {}}>
                <p>{getStateMessage()}</p>
                <p>Press ESC to exit full screen</p>
                <p className="mt-2">All UI elements are dark red to prevent</p>
                <p>accidental exposure of your photo paper</p>
            </div>
        </div>
    );
};

// Update the ExposureStepper component with more prominent labels
const ExposureStepper = ({currentState}) => {
    const steps = [
        {name: "Setup", description: "Adjust settings", label: "1: SETUP"},
        {name: "Align", description: "Position paper with red filter", label: "2: ALIGN"},
        {name: "Ready", description: "Paper in place", label: "3: READY"},
        {name: "Expose", description: "Exposing paper", label: "4: EXPOSE"},
        {name: "Complete", description: "Exposure complete", label: "5: COMPLETE"}
    ];

    return (
        <div className="w-full py-4 px-2" style={{color: 'var(--custom-red, #500)'}}>
            <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                    <React.Fragment key={index}>
                        {/* Step circle with label */}
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                                    index === currentState ? 'border-[var(--custom-red)] bg-[var(--custom-red,#500)]' : 'border-[var(--custom-red,#500)]'
                                }`}
                                style={{
                                    opacity: index === currentState ? 1 : 0.6,
                                    color: index === currentState ? 'black' : 'var(--custom-red,#500)'
                                }}
                            >
                                {index + 1}
                            </div>
                            <div
                                className="text-xs mt-1 text-center font-bold"
                                style={{
                                    opacity: index === currentState ? 1 : 0.6,
                                    letterSpacing: '0.05em'
                                }}
                            >
                                {step.label}
                            </div>
                            <div className="text-xs mt-0.5 text-center"
                                 style={{opacity: index === currentState ? 1 : 0.6}}>
                                {step.description}
                            </div>
                        </div>

                        {/* Connector line between steps (except after the last step) */}
                        {index < steps.length - 1 && (
                            <div
                                className="flex-1 h-0.5 mx-2"
                                style={{
                                    backgroundColor: 'var(--custom-red, #500)',
                                    opacity: 0.4
                                }}
                            />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Current mode indicator */}
            <div className="mt-4 text-center">
                <div className="text-lg font-bold" style={{color: 'var(--custom-red, #500)'}}>
                    CURRENT MODE: {steps[currentState].label}
                </div>
            </div>
        </div>
    );
};

const IlfordMultigradeConverter = () => {
    const [image, setImage] = useState(null);
    const [contrastGrade, setContrastGrade] = useState(2);
    const [invertImage, setInvertImage] = useState(true);
    const [brightness, setBrightness] = useState(100);
    const [scale, setScale] = useState(100);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [imageVisible, setImageVisible] = useState(true);
    const canvasRef = useRef(null);
    const fullScreenRef = useRef(null);
    const [exposureState, setExposureState] = useState(ExposureState.NORMAL);
    const [isRotated, setIsRotated] = useState(false);
    const [currentStrip, setCurrentStrip] = useState(0);
    const [totalStrips, setTotalStrips] = useState(5);
    const [isTestStripMode, setIsTestStripMode] = useState(false);
    const [visibleAreaWidth, setVisibleAreaWidth] = useState('100%');

    // Handle strip changes from Controls component
    const handleStripChange = (strip, total, isTestMode) => {
        setCurrentStrip(strip);
        setTotalStrips(total);
        setIsTestStripMode(isTestMode);
    };

    // Calculate visible area based on current strip (for test strip mode)
    const getVisibleAreaWidth = () => {
        if (!isTestStripMode || exposureState !== ExposureState.EXPOSE) {
            return '100%';
        }

        // Calculate the width of each strip
        const stripWidth = 100 / totalStrips;

        // For test strip mode, we show strips cumulatively from left to right
        // Strip 0 shows first strip, Strip 1 shows first and second strip, etc.
        console.log("setting width to", `${stripWidth * (currentStrip + 1)}%`)
        return `${stripWidth * (currentStrip + 1)}%`;
    };

    useEffect(() => {
        setVisibleAreaWidth(getVisibleAreaWidth());
    }, [isTestStripMode, exposureState, currentStrip, totalStrips]);


    // Approximate Ilford Multigrade filter colors for different grades (RGB values)
    // These are approximations based on Ilford's filter colors
    const gradeColors = {
        0: {r: 50, g: 255, b: 50},  // Very soft - strong green
        0.5: {r: 70, g: 240, b: 70},
        1: {r: 90, g: 220, b: 90},
        1.5: {r: 120, g: 200, b: 120},
        2: {r: 150, g: 180, b: 150}, // Normal - balanced
        2.5: {r: 170, g: 160, b: 170},
        3: {r: 190, g: 140, b: 190},
        3.5: {r: 210, g: 120, b: 210},
        4: {r: 230, g: 100, b: 230},
        4.5: {r: 240, g: 80, b: 240},
        5: {r: 255, g: 50, b: 255}   // High contrast - magenta/blue
    };

    // First, add the red alignment filter to gradeColors or create a separate constant
    const alignmentFilter = {r: 50, g: 0, b: 0};

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    // Check if image is portrait (taller than wide)
                    const isPortrait = img.height > img.width;
                    setIsRotated(isPortrait);
                    setImage(img);
                };
                img.src = event.target.result;
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
                setExposureState(ExposureState.NORMAL);
            } else if (image) {
                // Re-render the image when entering full screen
                setTimeout(() => renderImage(), 100);
            }
        };

        const handleKeyPress = (e) => {
            if (isFullScreen && e.code === 'Space') {
                e.preventDefault();
                setExposureState((current) => (current + 1) % 5); // Cycle through states 0-4
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
    }, [image, contrastGrade, scale, invertImage, brightness, isFullScreen, exposureState, scale, visibleAreaWidth, isTestStripMode]);

    const renderImage = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', {willReadFrequently: true});
        if (!ctx) return;

        // Get dimensions based on rotation to determine orientation
        const imgIsPortrait = image.height > image.width;
        const imgWidth = imgIsPortrait ? image.height : image.width;
        const imgHeight = imgIsPortrait ? image.width : image.height;

        if (isFullScreen) {
            // Get the full screen dimensions
            const screenWidth = document.documentElement.clientWidth || window.innerWidth;
            const screenHeight = document.documentElement.clientHeight || window.innerHeight;

            const imageRatio = imgWidth / imgHeight;
            const screenRatio = screenWidth / screenHeight;

            if (imageRatio > screenRatio) {
                // Image is wider than screen ratio - fit to width
                canvas.width = screenWidth;
                canvas.height = screenWidth / imageRatio;
            } else {
                // Image is taller than screen ratio - fit to height
                canvas.height = screenHeight;
                canvas.width = screenHeight * imageRatio;
            }
        } else {
            // Normal preview mode
            const containerWidth = canvas.parentNode.clientWidth;
            const containerHeight = canvas.parentNode.clientHeight;

            const imageRatio = imgWidth / imgHeight;
            const containerRatio = containerWidth / containerHeight;

            if (imageRatio > containerRatio) {
                // Fit to width
                canvas.width = containerWidth;
                canvas.height = containerWidth / imageRatio;
            } else {
                // Fit to height
                canvas.height = containerHeight;
                canvas.width = containerHeight * imageRatio;
            }
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // save the unrotated context of the canvas so we can restore it later
        // the alternative is to untranslate & unrotate after drawing
        ctx.save();

        // move to the center of the canvas
        ctx.translate(canvas.width / 2, canvas.height / 2);

        // Calculate scaled dimensions once
        const scaleFactor = scale / 100;
        const scaledWidth = canvas.width * scaleFactor;
        const scaledHeight = canvas.height * scaleFactor;
        const stripCropFactor = isTestStripMode ? (1/totalStrips)*(currentStrip + 1) : 1;
        // Draw the image with proper orientation
        if (imgIsPortrait) {
            // Rotate the canvas 90 degrees (π/2 radians) for portrait orientation
            ctx.rotate(Math.PI / 2);

            // For portrait images, width and height are swapped after rotation
            const centerX = -scaledHeight / 2; // Center horizontally
            const centerY = -scaledWidth / 2;  // Center vertically

            //ctx.drawImage(image, centerX, centerY, scaledHeight, scaledWidth);
            // Parameters: image, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight
            ctx.drawImage(
                image,        // source image
                0,          // source X (left edge)
                0,          // source Y (top edge)
                imgHeight, // source width (20% of image width)
                imgWidth*stripCropFactor, // source height (full height)
                centerX, centerY, scaledHeight, scaledWidth*stripCropFactor
            );

        } else {
            // For landscape images, draw normally but centered
            const centerX = -scaledWidth / 2;  // Center horizontally
            const centerY = -scaledHeight / 2; // Center vertically

            //ctx.drawImage(image, centerX, centerY, scaledWidth, scaledHeight);
            ctx.drawImage(
                image,        // source image
                0,          // source X (left edge)
                0,          // source Y (top edge)
                imgWidth*stripCropFactor, // source width (20% of image width)
                imgHeight, // source height (full height)
                centerX, centerY, scaledWidth*stripCropFactor, scaledHeight
            );
        }


        // we’re done with the rotating so restore the unrotated context
        ctx.restore();

        // Get image data for processing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Get color for selected grade or use alignment filter
        const color = exposureState === ExposureState.ALIGN ? alignmentFilter : gradeColors[contrastGrade];

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

            // Apply the grade color or alignment filter, preserving luminosity
            data[i] = value * color.r / 255;     // R
            data[i + 1] = value * color.g / 255; // G
            data[i + 2] = value * color.b / 255; // B
        }

        // Put the modified image data back
        ctx.putImageData(imageData, 0, 0);
    };

    // Update the darkroomStyleOverrides with a larger cursor
    const darkroomStyleOverrides = isFullScreen ? {
        '--custom-red': '#500',
        '--custom-red-hover': '#600',
        '--custom-bg': '#000',
        // Larger cursor (32x32) with better visibility
        cursor: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath fill='%23500' d='M0 0l10 3-3 3 4 4-3 3-4-4-1 3z'/%3E%3C/svg%3E") 0 0, auto`,
        // Add cursor styles for all interactive states
        '--cursor-pointer': `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath fill='%23500' d='M0 0l10 3-3 3 4 4-3 3-4-4-1 3z'/%3E%3C/svg%3E") 0 0, pointer`
    } : {};

    // Add a style for interactive elements in fullscreen mode
    const darkroomInteractiveStyle = isFullScreen ? {
        cursor: 'var(--cursor-pointer)'
    } : {};

    // Add resize handler
    useEffect(() => {
        const handleResize = () => {
            if (isFullScreen && image && canvasRef.current) {
                renderImage();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isFullScreen, image]);

    // Add a useEffect to set the document background color
    useEffect(() => {
        // Save the original background color
        const originalBg = document.body.style.backgroundColor;
        const originalColor = document.body.style.color;

        // Set dark theme for the entire page
        document.body.style.backgroundColor = '#121212';
        document.body.style.color = '#e0e0e0';

        // Restore original on component unmount
        return () => {
            document.body.style.backgroundColor = originalBg;
            document.body.style.color = originalColor;
        };
    }, []);

    // Update the dark theme style for better contrast
    const darkThemeStyle = {
        '--card-bg': '#1e1e1e',
        '--card-border': '#333',
        '--text-primary': '#e0e0e0',
        '--text-secondary': '#a0a0a0',
        '--button-bg': '#333',
        '--button-border': '#555',
        '--button-hover': '#444',
        '--slider-track': '#444',
        '--slider-range': '#666',
        '--slider-thumb': '#888',
        '--page-bg': '#121212',
    };

    return (
        <div className="flex flex-col min-h-screen p-4 w-full bg-[var(--page-bg)]"
             style={isFullScreen ? darkroomStyleOverrides : darkThemeStyle}>
            <div
                ref={fullScreenRef}
                className={`
          ${isFullScreen ? 'fixed inset-0 bg-black' : 'flex-1'} 
          flex flex-col
          ${isFullScreen ? '[&_button]:cursor-[var(--cursor-pointer)] [&_input]:cursor-[var(--cursor-pointer)] [&_[role=slider]]:cursor-[var(--cursor-pointer)]' : ''}
        `}
                style={isFullScreen ? {
                    backgroundColor: 'var(--custom-bg, #000)',
                    color: 'var(--custom-red, #500)',
                    cursor: 'inherit'
                } : {
                    backgroundColor: 'var(--page-bg)',
                }}
            >
                {isFullScreen ? (
                    <div className="flex flex-col h-screen relative">
                        {/* Top section with header only - absolute positioned */}
                        <div
                            className={`absolute top-0 left-0 w-full z-10 ${exposureState === ExposureState.EXPOSE || exposureState === ExposureState.BLANK ? 'hidden' : ''}`}
                        >
                            <div className="p-4 border-b" style={{
                                borderColor: 'var(--custom-red, #500)',
                                backgroundColor: 'var(--custom-bg, #000)'
                            }}>
                                <div className="flex items-center">
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
                                    <h2 className="text-xl font-bold ml-12" style={{color: 'var(--custom-red, #500)'}}>
                                        Ilford Multigrade Printing Mode
                                    </h2>

                                </div>
                            </div>
                        </div>

                        {/* Main content area - absolute positioned UI, fixed canvas position */}
                        <div className="flex h-full w-full">
                            {/* Left side - UI with fixed width - absolute positioned */}
                            <div
                                className={`absolute top-[69px] left-0 bottom-0 w-1/3 flex flex-col z-1000 ${exposureState === ExposureState.EXPOSE || exposureState === ExposureState.BLANK ? 'hidden' : ''}`}
                            >
                                {/* Controls section */}
                                <div className="p-4 flex-1 overflow-y-auto">
                                    <Controls
                                        isFullScreen={isFullScreen}
                                        exposureState={exposureState}
                                        contrastGrade={contrastGrade}
                                        setContrastGrade={setContrastGrade}
                                        scale={scale}
                                        setScale={setScale}
                                        setExposureState={setExposureState}
                                        brightness={brightness}
                                        setBrightness={setBrightness}
                                        invertImage={invertImage}
                                        setInvertImage={setInvertImage}
                                        imageVisible={imageVisible}
                                        setImageVisible={setImageVisible}
                                        handleImageUpload={handleImageUpload}
                                        onStripChange={handleStripChange}
                                        testStripMode={isTestStripMode}
                                    />
                                </div>

                                {/* Stepper at the bottom */}
                                <div className="p-4 border-t" style={{borderColor: 'var(--custom-red, #500)'}}>
                                    <ExposureStepper currentState={exposureState}/>
                                </div>
                            </div>


                            {/* Canvas container - positioned on the right side */}
                            <div className="absolute top-0 right-0 bottom-0 flex items-center justify-end z-100">

                                {image && (
                                    <canvas
                                        ref={canvasRef}
                                        className="h-full object-contain object-right"
                                        style={{
                                            visibility: exposureState === ExposureState.HIDDEN || exposureState === ExposureState.BLANK ? 'hidden' : 'visible',
                                            maxWidth: '100%'
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <Card className="shadow-lg border-[var(--card-border)] w-full max-w-6xl mx-auto"
                          style={{backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)'}}>
                        <CardHeader className="border-b border-[var(--card-border)]">
                            <div className="flex justify-between items-center">
                                <CardTitle style={{color: 'var(--text-primary)'}}>Ilford Multigrade Digital
                                    Enlarger</CardTitle>
                                <Button
                                    onClick={toggleFullScreen}
                                    variant="outline"
                                    disabled={!image}
                                    className="hover:bg-[var(--button-hover)]"
                                    style={{
                                        backgroundColor: 'var(--button-bg)',
                                        borderColor: 'var(--button-border)',
                                        color: 'var(--text-primary)'
                                    }}
                                >
                                    Enter Full Screen for Printing
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Controls
                                        isFullScreen={false}
                                        exposureState={exposureState}
                                        contrastGrade={contrastGrade}
                                        setContrastGrade={setContrastGrade}
                                        scale={scale}
                                        setScale={setScale}
                                        setExposureState={setExposureState}
                                        brightness={brightness}
                                        setBrightness={setBrightness}
                                        invertImage={invertImage}
                                        setInvertImage={setInvertImage}
                                        imageVisible={imageVisible}
                                        setImageVisible={setImageVisible}
                                        handleImageUpload={handleImageUpload}
                                        onStripChange={handleStripChange}
                                        testStripMode={isTestStripMode}
                                    />
                                </div>

                                <div className="bg-black p-2 rounded-md flex items-center justify-center min-h-64">
                                    {image ? (
                                        <canvas
                                            ref={canvasRef}
                                            className="max-h-96 max-w-full object-contain"
                                        />
                                    ) : (
                                        <div className="text-white text-center p-8">
                                            Upload an image to preview
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default IlfordMultigradeConverter;