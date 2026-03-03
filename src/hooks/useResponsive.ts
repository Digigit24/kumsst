import { useEffect, useState } from 'react';

export const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  laptop: 1024,
  desktop: 1280,
} as const;

type Breakpoint = keyof typeof BREAKPOINTS;

export function useResponsive() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    if (typeof window === 'undefined') return 'desktop';
    const width = window.innerWidth;
    if (width < BREAKPOINTS.mobile) return 'mobile';
    if (width < BREAKPOINTS.tablet) return 'tablet';
    if (width < BREAKPOINTS.laptop) return 'laptop';
    return 'desktop';
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < BREAKPOINTS.mobile) setBreakpoint('mobile');
      else if (width < BREAKPOINTS.tablet) setBreakpoint('tablet');
      else if (width < BREAKPOINTS.laptop) setBreakpoint('laptop');
      else setBreakpoint('desktop');
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isLaptop: breakpoint === 'laptop',
    isDesktop: breakpoint === 'desktop',
    isMobileOrTablet: breakpoint === 'mobile' || breakpoint === 'tablet',
    breakpoint,
  };
}

export function useIsMobile() {
  const { isMobile } = useResponsive();
  return isMobile;
}

export function useIsMobileOrTablet() {
  const { isMobileOrTablet } = useResponsive();
  return isMobileOrTablet;
}
