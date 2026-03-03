import { useState, useEffect } from 'react';
import InaugurationPage from '../pages/InaugurationPage';

const INAUGURATION_SEEN_KEY = 'inauguraton_seen';

interface InaugurationWrapperProps {
  children: React.ReactNode;
}

const InaugurationWrapper = ({ children }: InaugurationWrapperProps) => {
  const [hasSeenInauguration, setHasSeenInauguration] = useState<boolean | null>(null);

  useEffect(() => {
    const seen = localStorage.getItem(INAUGURATION_SEEN_KEY);
    setHasSeenInauguration(seen === 'true');
  }, []);

  // Show loading state while checking localStorage
  if (hasSeenInauguration === null) {
    return null;
  }

  // If not seen, show inauguration page
  if (!hasSeenInauguration) {
    return <InaugurationPage />;
  }

  // If seen, show normal app
  return <>{children}</>;
};

export default InaugurationWrapper;
