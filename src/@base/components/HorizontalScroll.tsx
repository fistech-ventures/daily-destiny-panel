import { cn } from '@lib/utils';
import type { ClassValue } from 'clsx';
import React, { useEffect, useRef, useState } from 'react';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

interface INavigation {
  isPrevEl?: boolean;
  isNextEl?: boolean;
}

interface IProps {
  prevClassName?: ClassValue;
  nextClassName?: ClassValue;
  className?: ClassValue;
  rootClassName?: ClassValue;
  navigation?: INavigation;
  children: React.ReactNode;
}

const HorizontalScroll: React.FC<IProps> = ({
  prevClassName,
  nextClassName,
  className,
  rootClassName,
  navigation = { isPrevEl: false, isNextEl: false },
  children,
}) => {
  const horizontalScrollRef = useRef(null);
  const startClientX = useRef(null);
  const [isDragging, setDragging] = useState(false);
  const [scrollX, setScrollX] = useState(0);
  const [isScrollEnd, setScrollEnd] = useState(false);

  const slideFn = (shift) => {
    horizontalScrollRef.current.scrollBy({
      left: shift,
      behavior: 'smooth',
    });

    horizontalScrollRef.current.scrollLeft += shift;
    setScrollX(scrollX + shift);

    if (
      Math.floor(horizontalScrollRef.current.scrollWidth - horizontalScrollRef.current.scrollLeft) <=
      horizontalScrollRef.current.offsetWidth
    ) {
      setScrollEnd(true);
    } else {
      setScrollEnd(false);
    }
  };

  const scrollCheckFn = () => {
    setScrollX(horizontalScrollRef.current.scrollLeft);

    if (
      Math.floor(horizontalScrollRef.current.scrollWidth - horizontalScrollRef.current.scrollLeft) <=
      horizontalScrollRef.current.offsetWidth
    ) {
      setScrollEnd(true);
    } else {
      setScrollEnd(false);
    }
  };

  const handleStartFn = (clientX) => {
    setDragging(true);
    startClientX.current = clientX;
  };

  useEffect(() => {
    const handleMoveFn = (e) => {
      if (!isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const movementX = startClientX.current - clientX;
      horizontalScrollRef.current.classList.add('scrolling');
      horizontalScrollRef.current.scrollLeft += movementX;

      startClientX.current = clientX;
    };

    const handleEndFn = () => {
      setDragging(false);
      horizontalScrollRef.current.classList.remove('scrolling');
      document.removeEventListener('mousemove', handleMoveFn);
      document.removeEventListener('touchmove', handleMoveFn);
      document.removeEventListener('mouseup', handleEndFn);
      document.removeEventListener('touchend', handleEndFn);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMoveFn);
      document.addEventListener('touchmove', handleMoveFn);
      document.addEventListener('mouseup', handleEndFn);
      document.addEventListener('touchend', handleEndFn);
    }

    return () => {
      document.removeEventListener('mousemove', handleMoveFn);
      document.removeEventListener('touchmove', handleMoveFn);
      document.removeEventListener('mouseup', handleEndFn);
      document.removeEventListener('touchend', handleEndFn);
    };
  }, [isDragging]);

  return (
    <div className={cn('flex items-center gap-4 w-full overflow-x-hidden', 'horizontal_scroll', rootClassName)}>
      {navigation?.isPrevEl && (
        <span
          className={cn(
            'cursor-pointer',
            {
              'opacity-50 cursor-not-allowed': scrollX < 1,
            },
            'horizontal_scroll_prev',
            prevClassName,
          )}
          onClick={() => slideFn(-100)}
        >
          <IoIosArrowBack size={32} />
        </span>
      )}
      <div
        ref={horizontalScrollRef}
        className={cn(
          'flex gap-x-2 max-w-full overflow-x-hidden scroll-smooth select-none [&.scrolling]:scroll-auto [&_*]:[&.scrolling]:pointer-events-none [&_>_*]:shrink-0',
          'horizontal_scroll_wrapper',
          className,
        )}
        onMouseDown={(e) => handleStartFn(e.clientX)}
        onTouchStart={(e) => handleStartFn(e.touches[0].clientX)}
        onScroll={scrollCheckFn}
      >
        {children}
      </div>
      {navigation?.isNextEl && (
        <span
          className={cn(
            'cursor-pointer',
            {
              'opacity-50 cursor-not-allowed': isScrollEnd,
            },
            'horizontal_scroll_next',
            nextClassName,
          )}
          onClick={() => slideFn(100)}
        >
          <IoIosArrowForward size={32} />
        </span>
      )}
    </div>
  );
};

export default HorizontalScroll;
