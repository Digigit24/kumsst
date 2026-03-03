/**
 * SuccessAnimation Component
 * Animated success celebration with confetti burst and floating receipt card
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { CheckCircle, Printer, Plus } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface SuccessAnimationProps {
  show: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  onPrintReceipt?: () => void;
  onCollectAnother?: () => void;
  className?: string;
}

export const SuccessAnimation = ({
  show,
  onClose,
  title = 'Payment Collected!',
  subtitle,
  onPrintReceipt,
  onCollectAnother,
  className,
}: SuccessAnimationProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (show) {
      setShowConfetti(true);
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <>
          {showConfetti && (
            <Confetti
              width={dimensions.width}
              height={dimensions.height}
              recycle={false}
              numberOfPieces={200}
              gravity={0.3}
              colors={['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#fbbf24', '#f59e0b']}
              style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }}
            />
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ type: 'spring', bounce: 0.35, duration: 0.6 }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                'relative w-full max-w-sm rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-8 shadow-2xl shadow-emerald-500/25',
                className
              )}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: 'spring', bounce: 0.5 }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20"
              >
                <CheckCircle className="h-10 w-10 text-white" />
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-center text-xl font-bold text-white"
              >
                {title}
              </motion.h3>

              {subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="mt-2 text-center text-sm text-emerald-100"
                >
                  {subtitle}
                </motion.p>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="mt-6 flex gap-3"
              >
                {onPrintReceipt && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1 bg-white/20 text-white hover:bg-white/30 border-0"
                    onClick={onPrintReceipt}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Print Receipt
                  </Button>
                )}
                {onCollectAnother && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1 bg-white text-emerald-700 hover:bg-white/90 border-0"
                    onClick={onCollectAnother}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Collect Another
                  </Button>
                )}
              </motion.div>

              {!onPrintReceipt && !onCollectAnother && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 text-center"
                >
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/20 text-white hover:bg-white/30 border-0"
                    onClick={onClose}
                  >
                    Continue
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
