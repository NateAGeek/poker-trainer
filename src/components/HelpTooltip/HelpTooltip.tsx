import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './HelpTooltip.scss';

interface HelpTooltipProps {
  content: string;
  className?: string;
}

interface TooltipPosition {
  top: number;
  left: number;
}

export function HelpTooltip({ content, className = '' }: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Calculate tooltip position relative to viewport using actual measurements
  const updateTooltipPosition = useCallback(() => {
    if (triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const spacing = 12;
      const arrowHeight = 8;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Default: position above the trigger, CSS will center with transform: translateX(-50%)
      let top = triggerRect.top - tooltipRect.height - arrowHeight - spacing;
      let left = triggerRect.left + triggerRect.width / 2; // Center on trigger
      
      // If tooltip would go off the top, position below instead
      if (top < spacing) {
        top = triggerRect.bottom + arrowHeight + spacing;
      }
      
      // If tooltip would still go off bottom, position in viewport
      if (top + tooltipRect.height > viewportHeight - spacing) {
        top = Math.max(spacing, viewportHeight - tooltipRect.height - spacing);
      }
      
      // Adjust horizontal position if tooltip would go off screen
      // Account for the fact that CSS translateX(-50%) will center it
      const halfTooltipWidth = tooltipRect.width / 2;
      if (left - halfTooltipWidth < spacing) {
        left = spacing + halfTooltipWidth;
      } else if (left + halfTooltipWidth > viewportWidth - spacing) {
        left = viewportWidth - spacing - halfTooltipWidth;
      }
      
      setTooltipPosition({ top, left });
    }
  }, []);

  // Handle click outside to close tooltip
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    }

    function handleResize() {
      if (isVisible) {
        updateTooltipPosition();
      }
    }

    function handleScroll() {
      if (isVisible) {
        updateTooltipPosition();
      }
    }

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isVisible, updateTooltipPosition]);

  const handleClick = () => {
    if (isVisible) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
      // Update position after tooltip is rendered
      setTimeout(() => {
        updateTooltipPosition();
      }, 0);
    }
  };

  // Apply positioning to portal element and update position after render
  useEffect(() => {
    if (isVisible && tooltipRef.current) {
      tooltipRef.current.style.top = `${tooltipPosition.top}px`;
      tooltipRef.current.style.left = `${tooltipPosition.left}px`;
      
      // Update position again after content is fully rendered for accuracy
      const timer = setTimeout(() => {
        updateTooltipPosition();
      }, 10);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, tooltipPosition, updateTooltipPosition]);

  return (
    <div className={`help-tooltip ${className}`}>
      <button
        ref={triggerRef}
        className={`help-tooltip__trigger ${isVisible ? 'help-tooltip__trigger--toggled' : ''}`}
        onClick={handleClick}
        aria-label="Help information"
        type="button"
      >
        ?
      </button>
      {isVisible && createPortal(
        <div 
          ref={tooltipRef}
          className="help-tooltip__portal-content" 
          role="tooltip"
        >
          {content}
        </div>,
        document.body
      )}
    </div>
  );
}