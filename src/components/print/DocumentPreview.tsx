/**
 * Document Preview Component
 * Shows a live preview of print configuration settings
 * Supports interactive mode for changing positions by clicking or dragging (X and Y axis)
 * Now supports dragging in both HEADER and FOOTER areas
 */

import { FileText, Move } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface SignatoryInfo {
  name: string;
  designation: string;
  signature_image?: string | null;
}

type HeaderLayout = 'stacked' | 'side-by-side';
type TextAlign = 'left' | 'center' | 'right';

interface DocumentPreviewProps {
  logo?: string | null;
  logoPreview?: string | null;
  logoPosition?: 'left' | 'center' | 'right';
  logoXPosition?: number; // 0-100 percentage
  logoYPosition?: number; // 0-100 percentage
  logoWidth?: number; // Logo width in px
  logoHeight?: number; // Logo height in px
  headerContent?: string;
  headerImage?: string | null;
  headerImagePreview?: string | null;
  headerBackgroundColor?: string;
  headerTextColor?: string;
  headerLineColor?: string;
  headerLineStyle?: 'partial' | 'full';
  headerHeight?: number;
  headerLayout?: HeaderLayout;
  headerTextAlign?: TextAlign;
  headerTextXPosition?: number; // 0-100 percentage
  headerTextYPosition?: number; // 0-100 percentage
  showHeaderLine?: boolean;
  footerContent?: string;
  footerImage?: string | null;
  footerImagePreview?: string | null;
  footerBackgroundColor?: string;
  footerTextColor?: string;
  footerLineColor?: string;
  footerLineStyle?: 'partial' | 'full';
  footerHeight?: number;
  footerTextXPosition?: number; // 0-100 percentage
  footerTextYPosition?: number; // 0-100 percentage
  showFooterLine?: boolean;
  showPageNumbers?: boolean;
  watermarkText?: string;
  watermarkImage?: string | null;
  watermarkImagePreview?: string | null;
  watermarkOpacity?: number;
  paperSize?: 'A4' | 'A5' | 'Letter' | 'Legal';
  fontFamily?: string;
  fontSize?: number;
  signatories?: SignatoryInfo[];
  // Custom body content (e.g., rendered template HTML)
  bodyContent?: string;
  // Interactive mode props
  interactive?: boolean;
  onLogoPositionChange?: (position: 'left' | 'center' | 'right') => void;
  onLogoXPositionChange?: (position: number) => void;
  onLogoYPositionChange?: (position: number) => void;
  onHeaderTextAlignChange?: (align: TextAlign) => void;
  onHeaderTextXPositionChange?: (position: number) => void;
  onHeaderTextYPositionChange?: (position: number) => void;
  onFooterTextXPositionChange?: (position: number) => void;
  onFooterTextYPositionChange?: (position: number) => void;
  onHeaderLayoutChange?: (layout: HeaderLayout) => void;
  onLogoWidthChange?: (width: number) => void;
  onLogoHeightChange?: (height: number) => void;
}

const PAPER_DIMENSIONS = {
  A4: { width: 210, height: 297, label: 'A4' },
  A5: { width: 148, height: 210, label: 'A5' },
  Letter: { width: 216, height: 279, label: 'Letter' },
  Legal: { width: 216, height: 356, label: 'Legal' },
};

export const DocumentPreview = ({
  logo,
  logoPreview,
  logoPosition = 'left',
  logoXPosition,
  logoYPosition,
  logoWidth,
  logoHeight,
  headerContent = '',
  headerImage,
  headerImagePreview,
  headerBackgroundColor = 'transparent',
  headerTextColor = '#1f2937',
  headerLineColor = '#9ca3af',
  headerLineStyle = 'partial',
  headerHeight = 80,
  headerLayout = 'side-by-side',
  headerTextAlign = 'right',
  headerTextXPosition,
  headerTextYPosition,
  showHeaderLine = true,
  footerContent = '',
  footerImage,
  footerImagePreview,
  footerBackgroundColor = 'transparent',
  footerTextColor = '#4b5563',
  footerLineColor = '#9ca3af',
  footerLineStyle = 'partial',
  footerHeight = 40,
  footerTextXPosition,
  footerTextYPosition,
  showFooterLine = true,
  showPageNumbers = true,
  watermarkText = '',
  watermarkImage,
  watermarkImagePreview,
  watermarkOpacity = 0.1,
  paperSize = 'A4',
  fontFamily = 'Arial, sans-serif',
  fontSize = 12,
  signatories = [],
  bodyContent,
  interactive = false,
  onLogoPositionChange,
  onLogoXPositionChange,
  onLogoYPositionChange,
  onHeaderTextAlignChange,
  onHeaderTextXPositionChange,
  onHeaderTextYPositionChange,
  onFooterTextXPositionChange,
  onFooterTextYPositionChange,
  onHeaderLayoutChange,
  onLogoWidthChange,
  onLogoHeightChange,
}: DocumentPreviewProps) => {
  const paper = PAPER_DIMENSIONS[paperSize] || PAPER_DIMENSIONS.A4;

  // Scale factor for preview
  const scale = 2.4;
  const previewWidth = paper.width * scale;
  const previewHeight = paper.height * scale;

  // Content padding
  const contentPadding = 15 * scale;

  // Drag state for header
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [isDraggingHeaderText, setIsDraggingHeaderText] = useState(false);
  const [headerDragPositionX, setHeaderDragPositionX] = useState<number | null>(null);
  const [headerDragPositionY, setHeaderDragPositionY] = useState<number | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Drag state for footer
  const [isDraggingFooterText, setIsDraggingFooterText] = useState(false);
  const [footerDragPositionX, setFooterDragPositionX] = useState<number | null>(null);
  const [footerDragPositionY, setFooterDragPositionY] = useState<number | null>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  // Logo selection & resize state
  const [isLogoSelected, setIsLogoSelected] = useState(false);
  const [isResizingLogo, setIsResizingLogo] = useState(false);
  const [resizeStartPos, setResizeStartPos] = useState<{ x: number; y: number } | null>(null);
  const [resizeStartSize, setResizeStartSize] = useState<{ w: number; h: number } | null>(null);
  const [liveLogoSize, setLiveLogoSize] = useState<{ w: number; h: number } | null>(null);
  const logoImgRef = useRef<HTMLImageElement>(null);

  // Use preview images if available
  const displayLogo = logoPreview || logo;
  const displayWatermarkImage = watermarkImagePreview || watermarkImage;
  const displayHeaderImage = headerImagePreview || headerImage;
  const displayFooterImage = footerImagePreview || footerImage;

  // Calculate position from percentage
  const calculatePosition = (percentage: number | undefined) => {
    if (percentage === undefined || percentage === null) return undefined;
    return `${percentage}%`;
  };

  // Handle drag start
  const handleDragStart = useCallback((e: React.MouseEvent, type: 'logo' | 'headerText' | 'footerText') => {
    if (!interactive) return;
    e.preventDefault();
    e.stopPropagation();

    if (type === 'logo') {
      setIsDraggingLogo(true);
    } else if (type === 'headerText') {
      setIsDraggingHeaderText(true);
    } else if (type === 'footerText') {
      setIsDraggingFooterText(true);
    }
  }, [interactive]);

  // Handle drag move for header
  const handleHeaderDragMove = useCallback((e: MouseEvent) => {
    if (!headerRef.current || (!isDraggingLogo && !isDraggingHeaderText)) return;

    const headerRect = headerRef.current.getBoundingClientRect();
    const relativeX = e.clientX - headerRect.left;
    const relativeY = e.clientY - headerRect.top;

    const percentageX = Math.max(0, Math.min(100, (relativeX / headerRect.width) * 100));
    const percentageY = Math.max(0, Math.min(100, (relativeY / headerRect.height) * 100));

    setHeaderDragPositionX(percentageX);
    setHeaderDragPositionY(percentageY);
  }, [isDraggingLogo, isDraggingHeaderText]);

  // Handle drag move for footer
  const handleFooterDragMove = useCallback((e: MouseEvent) => {
    if (!footerRef.current || !isDraggingFooterText) return;

    const footerRect = footerRef.current.getBoundingClientRect();
    const relativeX = e.clientX - footerRect.left;
    const relativeY = e.clientY - footerRect.top;

    const percentageX = Math.max(0, Math.min(100, (relativeX / footerRect.width) * 100));
    const percentageY = Math.max(0, Math.min(100, (relativeY / footerRect.height) * 100));

    setFooterDragPositionX(percentageX);
    setFooterDragPositionY(percentageY);
  }, [isDraggingFooterText]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    // Header elements
    if (headerDragPositionX !== null && headerDragPositionY !== null) {
      if (isDraggingLogo) {
        if (onLogoXPositionChange) onLogoXPositionChange(Math.round(headerDragPositionX));
        if (onLogoYPositionChange) onLogoYPositionChange(Math.round(headerDragPositionY));
      } else if (isDraggingHeaderText) {
        if (onHeaderTextXPositionChange) onHeaderTextXPositionChange(Math.round(headerDragPositionX));
        if (onHeaderTextYPositionChange) onHeaderTextYPositionChange(Math.round(headerDragPositionY));
      }
    }

    // Footer elements
    if (footerDragPositionX !== null && footerDragPositionY !== null) {
      if (isDraggingFooterText) {
        if (onFooterTextXPositionChange) onFooterTextXPositionChange(Math.round(footerDragPositionX));
        if (onFooterTextYPositionChange) onFooterTextYPositionChange(Math.round(footerDragPositionY));
      }
    }

    // Reset all drag states
    setIsDraggingLogo(false);
    setIsDraggingHeaderText(false);
    setIsDraggingFooterText(false);
    setHeaderDragPositionX(null);
    setHeaderDragPositionY(null);
    setFooterDragPositionX(null);
    setFooterDragPositionY(null);
  }, [headerDragPositionX, headerDragPositionY, footerDragPositionX, footerDragPositionY, isDraggingLogo, isDraggingHeaderText, isDraggingFooterText, onLogoXPositionChange, onLogoYPositionChange, onHeaderTextXPositionChange, onHeaderTextYPositionChange, onFooterTextXPositionChange, onFooterTextYPositionChange]);

  // Add/remove event listeners for dragging
  useEffect(() => {
    if (isDraggingLogo || isDraggingHeaderText) {
      window.addEventListener('mousemove', handleHeaderDragMove);
      window.addEventListener('mouseup', handleDragEnd);

      return () => {
        window.removeEventListener('mousemove', handleHeaderDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDraggingLogo, isDraggingHeaderText, handleHeaderDragMove, handleDragEnd]);

  useEffect(() => {
    if (isDraggingFooterText) {
      window.addEventListener('mousemove', handleFooterDragMove);
      window.addEventListener('mouseup', handleDragEnd);

      return () => {
        window.removeEventListener('mousemove', handleFooterDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDraggingFooterText, handleFooterDragMove, handleDragEnd]);

  // Logo resize handlers
  const handleLogoResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Get the current rendered size of the logo image
    if (logoImgRef.current) {
      const rect = logoImgRef.current.getBoundingClientRect();
      setResizeStartPos({ x: e.clientX, y: e.clientY });
      setResizeStartSize({ w: rect.width, h: rect.height });
      setIsResizingLogo(true);
    }
  }, []);

  const handleLogoResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizingLogo || !resizeStartPos || !resizeStartSize) return;

    const dx = e.clientX - resizeStartPos.x;
    const dy = e.clientY - resizeStartPos.y;
    // Use the larger delta to maintain aspect ratio
    const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy;

    const newW = Math.max(20, resizeStartSize.w + delta);
    const newH = Math.max(20, resizeStartSize.h + delta * (resizeStartSize.h / resizeStartSize.w));

    setLiveLogoSize({ w: newW, h: newH });
  }, [isResizingLogo, resizeStartPos, resizeStartSize]);

  const handleLogoResizeEnd = useCallback(() => {
    if (isResizingLogo && liveLogoSize) {
      // Convert from preview scaled px back to real px
      const realW = Math.round(liveLogoSize.w * 1.5 / scale);
      const realH = Math.round(liveLogoSize.h * 1.5 / scale);

      if (onLogoWidthChange) onLogoWidthChange(realW);
      if (onLogoHeightChange) onLogoHeightChange(realH);
    }

    setIsResizingLogo(false);
    setResizeStartPos(null);
    setResizeStartSize(null);
    setLiveLogoSize(null);
  }, [isResizingLogo, liveLogoSize, scale, onLogoWidthChange, onLogoHeightChange]);

  useEffect(() => {
    if (isResizingLogo) {
      window.addEventListener('mousemove', handleLogoResizeMove);
      window.addEventListener('mouseup', handleLogoResizeEnd);

      return () => {
        window.removeEventListener('mousemove', handleLogoResizeMove);
        window.removeEventListener('mouseup', handleLogoResizeEnd);
      };
    }
  }, [isResizingLogo, handleLogoResizeMove, handleLogoResizeEnd]);

  // Click outside logo to deselect
  const handlePreviewClick = useCallback((e: React.MouseEvent) => {
    // Check if click is on the logo or its children
    const target = e.target as HTMLElement;
    const logoContainer = target.closest('[data-logo-container]');
    if (!logoContainer) {
      setIsLogoSelected(false);
    }
  }, []);

  // Get current positions for display
  const currentLogoXPosition = isDraggingLogo && headerDragPositionX !== null ? headerDragPositionX : logoXPosition;
  const currentLogoYPosition = isDraggingLogo && headerDragPositionY !== null ? headerDragPositionY : logoYPosition;
  const currentHeaderTextXPosition = isDraggingHeaderText && headerDragPositionX !== null ? headerDragPositionX : headerTextXPosition;
  const currentHeaderTextYPosition = isDraggingHeaderText && headerDragPositionY !== null ? headerDragPositionY : headerTextYPosition;
  const currentFooterTextXPosition = isDraggingFooterText && footerDragPositionX !== null ? footerDragPositionX : footerTextXPosition;
  const currentFooterTextYPosition = isDraggingFooterText && footerDragPositionY !== null ? footerDragPositionY : footerTextYPosition;

  // Determine if we should use custom positioning
  const useCustomLogoPosition = (currentLogoXPosition !== undefined && currentLogoXPosition !== null) ||
    (currentLogoYPosition !== undefined && currentLogoYPosition !== null);
  const useCustomHeaderTextPosition = (currentHeaderTextXPosition !== undefined && currentHeaderTextXPosition !== null) ||
    (currentHeaderTextYPosition !== undefined && currentHeaderTextYPosition !== null);
  const useCustomFooterTextPosition = (currentFooterTextXPosition !== undefined && currentFooterTextXPosition !== null) ||
    (currentFooterTextYPosition !== undefined && currentFooterTextYPosition !== null);

  // Legacy logo alignment (fallback when not using custom position)
  const logoAlign = logoPosition === 'left' ? 'flex-start' : logoPosition === 'right' ? 'flex-end' : 'center';

  return (
    <div className="flex flex-col items-center w-full">
      {/* Paper size indicator */}
      <div className="mb-3 text-xs text-muted-foreground flex items-center gap-2">
        <FileText className="h-3.5 w-3.5" />
        <span>{paper.label} ({paper.width} × {paper.height} mm)</span>
      </div>

      {/* Document Preview */}
      <div
        className="relative bg-white rounded-sm shadow-2xl border border-gray-200 overflow-hidden"
        onClick={interactive ? handlePreviewClick : undefined}
        style={{
          width: `${previewWidth}px`,
          height: `${previewHeight}px`,
          fontFamily,
          fontSize: `${fontSize}px`,
        }}
      >
        {/* Watermark */}
        {(watermarkText || displayWatermarkImage) && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10 overflow-hidden"
            style={{ opacity: watermarkOpacity }}
          >
            <div style={{ transform: 'rotate(-45deg)' }}>
              {displayWatermarkImage ? (
                <img
                  src={displayWatermarkImage}
                  alt="Watermark"
                  style={{
                    maxWidth: '80%',
                    maxHeight: '80%',
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <span
                  style={{
                    fontSize: `${56 * scale}px`,
                    fontWeight: 'bold',
                    color: '#9ca3af',
                    letterSpacing: '0.15em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {watermarkText}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Full Page Layout */}
        <div className="relative h-full flex flex-col">
          {/* Header Section */}
          <div
            ref={headerRef}
            className={`shrink-0 w-full relative overflow-visible ${interactive ? 'group' : ''}`}
            style={{
              backgroundColor: headerBackgroundColor !== 'transparent' ? headerBackgroundColor : undefined,
              padding: `${10 * scale}px ${contentPadding}px`,
              height: `${headerHeight * scale / 1.5}px`,
            }}
          >
            {/* Header Background Image */}
            {displayHeaderImage && (
              <img
                src={displayHeaderImage}
                alt="Header Background"
                className="absolute inset-0 w-full h-full"
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
              />
            )}

            {/* Interactive Layout Toggle */}
            {interactive && onHeaderLayoutChange && (
              <button
                onClick={() => onHeaderLayoutChange(headerLayout === 'stacked' ? 'side-by-side' : 'stacked')}
                className="absolute top-1 right-1 z-20 p-1 bg-blue-500 text-white rounded text-[8px] opacity-0 group-hover:opacity-100 transition-opacity"
                title={`Switch to ${headerLayout === 'stacked' ? 'side-by-side' : 'stacked'} layout`}
              >
                <Move className="h-3 w-3" />
              </button>
            )}

            {/* Drag Guidelines for Header */}
            {interactive && (isDraggingLogo || isDraggingHeaderText) && (
              <div className="absolute inset-0 z-30 pointer-events-none">
                {/* Vertical gridlines */}
                {[0, 25, 50, 75, 100].map((pos) => (
                  <div
                    key={`v-${pos}`}
                    className="absolute top-0 bottom-0 border-l border-dashed border-blue-300"
                    style={{ left: `${pos}%` }}
                  />
                ))}
                {/* Horizontal gridlines */}
                {[0, 25, 50, 75, 100].map((pos) => (
                  <div
                    key={`h-${pos}`}
                    className="absolute left-0 right-0 border-t border-dashed border-blue-300"
                    style={{ top: `${pos}%` }}
                  />
                ))}
                {/* Current position crosshair */}
                {headerDragPositionX !== null && headerDragPositionY !== null && (
                  <>
                    <div
                      className="absolute top-0 bottom-0 border-l-2 border-blue-500"
                      style={{ left: `${headerDragPositionX}%` }}
                    />
                    <div
                      className="absolute left-0 right-0 border-t-2 border-blue-500"
                      style={{ top: `${headerDragPositionY}%` }}
                    />
                    <div
                      className="absolute bg-blue-500 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap"
                      style={{
                        left: `${headerDragPositionX}%`,
                        top: `${headerDragPositionY}%`,
                        transform: 'translate(-50%, -120%)'
                      }}
                    >
                      X: {Math.round(headerDragPositionX)}% | Y: {Math.round(headerDragPositionY)}%
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Header Content Overlay (Logo + Text) */}
            <div
              className={`relative z-10 h-full ${headerLayout === 'side-by-side'
                  ? 'flex items-center gap-3'
                  : 'flex flex-col justify-center'
                }`}
            >
              {/* Logo with Canva-style resize handles */}
              {displayLogo && (
                <div
                  data-logo-container
                  className={`relative ${interactive ? 'cursor-move' : ''} ${headerLayout === 'stacked' ? 'mb-1' : 'shrink-0'}`}
                  style={{
                    display: headerLayout === 'stacked' ? 'flex' : undefined,
                    justifyContent: headerLayout === 'stacked' && !useCustomLogoPosition ? logoAlign : undefined,
                    position: useCustomLogoPosition ? 'absolute' : undefined,
                    left: useCustomLogoPosition ? calculatePosition(currentLogoXPosition ?? 50) : undefined,
                    top: useCustomLogoPosition ? calculatePosition(currentLogoYPosition ?? 50) : undefined,
                    transform: useCustomLogoPosition ? 'translate(-50%, -50%)' : undefined,
                  }}
                  onMouseDown={(e) => {
                    // Don't start drag if clicking a resize handle
                    if ((e.target as HTMLElement).dataset.resizeHandle) return;
                    handleDragStart(e, 'logo');
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (interactive) {
                      if (!isLogoSelected) {
                        setIsLogoSelected(true);
                      } else if (onLogoPositionChange && !useCustomLogoPosition) {
                        const positions: Array<'left' | 'center' | 'right'> = ['left', 'center', 'right'];
                        const currentIndex = positions.indexOf(logoPosition);
                        const nextIndex = (currentIndex + 1) % positions.length;
                        onLogoPositionChange(positions[nextIndex]);
                      }
                    }
                  }}
                  title={interactive ? (useCustomLogoPosition ? `Logo: X=${Math.round(currentLogoXPosition ?? 50)}%, Y=${Math.round(currentLogoYPosition ?? 50)}% (drag to move, corners to resize)` : `Logo: Click to select, drag to position`) : undefined}
                >
                  <div className="relative inline-block">
                    <img
                      ref={logoImgRef}
                      src={displayLogo}
                      alt="Logo"
                      className="object-contain"
                      style={{
                        ...(liveLogoSize
                          ? { width: `${liveLogoSize.w}px`, height: `${liveLogoSize.h}px` }
                          : {
                            ...(logoWidth
                              ? { width: `${logoWidth * scale / 1.5}px` }
                              : { maxWidth: `${80 * scale}px` }),
                            ...(logoHeight
                              ? { height: `${logoHeight * scale / 1.5}px` }
                              : { maxHeight: `${(headerHeight - 20) * scale / 1.5}px` }),
                          }),
                        pointerEvents: 'none',
                        userSelect: 'none',
                        display: 'block',
                      }}
                      draggable={false}
                    />

                    {/* Selection border + corner resize handles (Canva-style) */}
                    {interactive && isLogoSelected && (
                      <>
                        {/* Selection border */}
                        <div className="absolute inset-0 border-2 border-blue-500 rounded-sm pointer-events-none" />

                        {/* Corner handles */}
                        {(['nw', 'ne', 'sw', 'se'] as const).map((corner) => (
                          <div
                            key={corner}
                            data-resize-handle="true"
                            onMouseDown={handleLogoResizeStart}
                            className="absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-sm z-20"
                            style={{
                              cursor: corner === 'nw' || corner === 'se' ? 'nwse-resize' : 'nesw-resize',
                              ...(corner.includes('n') ? { top: -5 } : { bottom: -5 }),
                              ...(corner.includes('w') ? { left: -5 } : { right: -5 }),
                            }}
                          />
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Header Content */}
              {headerContent && (
                <div
                  className={`print-content-wrapper leading-tight ${headerLayout === 'side-by-side' && !useCustomHeaderTextPosition ? 'flex-1' : ''} ${interactive ? 'cursor-move hover:ring-2 hover:ring-green-400 rounded px-1 transition-all' : ''
                    }`}
                  style={{
                    fontSize: `${fontSize * 1.1}px`,
                    color: headerTextColor,
                    textAlign: headerLayout === 'stacked' ? 'center' : (useCustomHeaderTextPosition ? 'left' : headerTextAlign),
                    position: useCustomHeaderTextPosition ? 'absolute' : undefined,
                    left: useCustomHeaderTextPosition ? calculatePosition(currentHeaderTextXPosition ?? 50) : undefined,
                    top: useCustomHeaderTextPosition ? calculatePosition(currentHeaderTextYPosition ?? 50) : undefined,
                    transform: useCustomHeaderTextPosition ? 'translate(-50%, -50%)' : undefined,
                    userSelect: 'none',
                  }}
                  onMouseDown={(e) => handleDragStart(e, 'headerText')}
                  onClick={interactive && onHeaderTextAlignChange && !useCustomHeaderTextPosition ? () => {
                    const aligns: TextAlign[] = ['left', 'center', 'right'];
                    const currentIndex = aligns.indexOf(headerTextAlign);
                    const nextIndex = (currentIndex + 1) % aligns.length;
                    onHeaderTextAlignChange(aligns[nextIndex]);
                  } : undefined}
                  title={interactive ? (useCustomHeaderTextPosition ? `Header Text: X=${Math.round(currentHeaderTextXPosition ?? 50)}%, Y=${Math.round(currentHeaderTextYPosition ?? 50)}% (drag to adjust)` : `Text align: ${headerTextAlign} (click to change)`) : undefined}
                  dangerouslySetInnerHTML={{ __html: headerContent }}
                />
              )}
            </div>
          </div>

          {/* Header Line */}
          {showHeaderLine && (
            <div
              className="shrink-0"
              style={{
                height: '2px',
                backgroundColor: headerLineColor,
                marginLeft: headerLineStyle === 'full' ? 0 : `${contentPadding}px`,
                marginRight: headerLineStyle === 'full' ? 0 : `${contentPadding}px`,
              }}
            />
          )}

          {/* Body Content */}
          <div
            className="flex-1 overflow-y-auto"
            style={{
              padding: `${12 * scale}px ${contentPadding}px`,
            }}
          >
            {bodyContent ? (
              <div
                className="print-content-wrapper text-gray-700 leading-relaxed"
                style={{ fontSize: `${fontSize}px` }}
                dangerouslySetInnerHTML={{ __html: bodyContent }}
              />
            ) : (
              <div
                className="text-gray-700 leading-relaxed"
                style={{ fontSize: `${fontSize}px` }}
              >
                <p className="font-bold mb-2 text-gray-900" style={{ fontSize: `${fontSize * 1.3}px` }}>
                  Sample Document Title
                </p>
                <p className="mb-2">
                  This is a preview of how your printed documents will appear with the current configuration settings.
                </p>
                <p className="mb-2">
                  The header, footer, watermark, and font settings are all reflected in this preview.
                </p>
                <p className="text-gray-500 mt-4" style={{ fontSize: `${fontSize * 0.9}px` }}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>
            )}

            {/* Signatories Section */}
            {signatories && signatories.length > 0 && (
              <div style={{ marginTop: `${24 * scale}px` }}>
                <div
                  className="flex justify-between gap-4"
                  style={{ fontSize: `${fontSize * 0.85}px` }}
                >
                  {signatories.slice(0, 3).map((signatory, index) => (
                    <div key={index} className="flex-1 text-center">
                      {signatory.signature_image && (
                        <img
                          src={signatory.signature_image}
                          alt={signatory.name}
                          className="mx-auto object-contain mb-1"
                          style={{ maxHeight: `${30 * scale}px`, maxWidth: `${60 * scale}px` }}
                        />
                      )}
                      <div className="border-t border-gray-400 pt-1 mt-1">
                        <p className="font-semibold text-gray-800">{signatory.name}</p>
                        <p className="text-gray-500" style={{ fontSize: `${fontSize * 0.75}px` }}>
                          {signatory.designation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Line */}
          {showFooterLine && (
            <div
              className="shrink-0"
              style={{
                height: '2px',
                backgroundColor: footerLineColor,
                marginLeft: footerLineStyle === 'full' ? 0 : `${contentPadding}px`,
                marginRight: footerLineStyle === 'full' ? 0 : `${contentPadding}px`,
              }}
            />
          )}

          {/* Footer Section */}
          <div
            ref={footerRef}
            className={`shrink-0 w-full mt-auto relative overflow-visible ${interactive ? 'group' : ''}`}
            style={{
              backgroundColor: footerBackgroundColor !== 'transparent' ? footerBackgroundColor : undefined,
              padding: `${8 * scale}px ${contentPadding}px`,
              height: `${footerHeight * scale / 1.5}px`,
            }}
          >
            {/* Footer Background Image */}
            {displayFooterImage && (
              <img
                src={displayFooterImage}
                alt="Footer Background"
                className="absolute inset-0 w-full h-full"
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
              />
            )}

            {/* Drag Guidelines for Footer */}
            {interactive && isDraggingFooterText && (
              <div className="absolute inset-0 z-30 pointer-events-none">
                {/* Vertical gridlines */}
                {[0, 25, 50, 75, 100].map((pos) => (
                  <div
                    key={`fv-${pos}`}
                    className="absolute top-0 bottom-0 border-l border-dashed border-purple-300"
                    style={{ left: `${pos}%` }}
                  />
                ))}
                {/* Horizontal gridlines */}
                {[0, 25, 50, 75, 100].map((pos) => (
                  <div
                    key={`fh-${pos}`}
                    className="absolute left-0 right-0 border-t border-dashed border-purple-300"
                    style={{ top: `${pos}%` }}
                  />
                ))}
                {/* Current position crosshair */}
                {footerDragPositionX !== null && footerDragPositionY !== null && (
                  <>
                    <div
                      className="absolute top-0 bottom-0 border-l-2 border-purple-500"
                      style={{ left: `${footerDragPositionX}%` }}
                    />
                    <div
                      className="absolute left-0 right-0 border-t-2 border-purple-500"
                      style={{ top: `${footerDragPositionY}%` }}
                    />
                    <div
                      className="absolute bg-purple-500 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap"
                      style={{
                        left: `${footerDragPositionX}%`,
                        top: `${footerDragPositionY}%`,
                        transform: 'translate(-50%, -120%)'
                      }}
                    >
                      X: {Math.round(footerDragPositionX)}% | Y: {Math.round(footerDragPositionY)}%
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Footer Content Overlay */}
            <div className="relative z-10 h-full flex items-center justify-between">
              {/* Footer Text */}
              {footerContent && (
                <div
                  className={`print-content-wrapper leading-tight ${!useCustomFooterTextPosition ? 'flex-1' : ''} ${interactive ? 'cursor-move hover:ring-2 hover:ring-purple-400 rounded px-1 transition-all' : ''
                    }`}
                  style={{
                    fontSize: `${fontSize * 0.85}px`,
                    color: footerTextColor,
                    position: useCustomFooterTextPosition ? 'absolute' : undefined,
                    left: useCustomFooterTextPosition ? calculatePosition(currentFooterTextXPosition ?? 50) : undefined,
                    top: useCustomFooterTextPosition ? calculatePosition(currentFooterTextYPosition ?? 50) : undefined,
                    transform: useCustomFooterTextPosition ? 'translate(-50%, -50%)' : undefined,
                    userSelect: 'none',
                  }}
                  onMouseDown={(e) => handleDragStart(e, 'footerText')}
                  title={interactive ? (useCustomFooterTextPosition ? `Footer Text: X=${Math.round(currentFooterTextXPosition ?? 50)}%, Y=${Math.round(currentFooterTextYPosition ?? 50)}% (drag to adjust)` : 'Click to drag footer text') : undefined}
                  dangerouslySetInnerHTML={{ __html: footerContent }}
                />
              )}

              {/* Page Numbers */}
              {showPageNumbers && !useCustomFooterTextPosition && (
                <div
                  className="shrink-0 ml-2"
                  style={{
                    fontSize: `${fontSize * 0.8}px`,
                    color: footerTextColor,
                  }}
                >
                  Page 1 of 1
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Label */}
      <div className="mt-3 text-xs text-muted-foreground text-center">
        {interactive ? (
          <span className="flex items-center justify-center gap-2">
            <Move className="h-3 w-3" />
            {isDraggingLogo || isDraggingHeaderText || isDraggingFooterText ? (
              <span className="text-blue-600 font-medium">Dragging... Release to set position</span>
            ) : (
              'Interactive Preview - Drag elements anywhere in header or footer (X & Y axis)'
            )}
          </span>
        ) : (
          'Live Preview'
        )}
      </div>
    </div>
  );
};

export default DocumentPreview;
