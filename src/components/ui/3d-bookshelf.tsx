
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

export interface ShelfCategory {
  id: number | string;
  name: string;
  count: number;
}

interface Bookshelf3DProps {
  categories: ShelfCategory[];
  onCategoryClick: (categoryName: string) => void;
  className?: string;
}

// Richer book spine colors
const spineColors = [
  'bg-red-900 border-l border-white/10',
  'bg-blue-900 border-l border-white/10',
  'bg-green-900 border-l border-white/10',
  'bg-amber-800 border-l border-white/10',
  'bg-purple-900 border-l border-white/10',
  'bg-slate-800 border-l border-white/10',
  'bg-cyan-900 border-l border-white/10',
  'bg-rose-950 border-l border-white/10'
];

interface BookSpineProps {
  height: number;
  width: number;
  colorIndex: number;
  delay: number;
}

const BookSpine = ({ height, width, colorIndex, delay }: BookSpineProps) => {
  const colorClass = spineColors[colorIndex % spineColors.length];

  return (
    <motion.div
      initial={{ scaleY: 0, opacity: 0 }}
      animate={{ scaleY: 1, opacity: 1 }}
      transition={{ delay: delay * 0.03, duration: 0.4, type: 'spring' }}
      style={{ height: `${height}%`, width: `${width}px` }}
      className={cn(
        "relative mx-[1px] rounded-sm shadow-sm cursor-pointer transition-all hover:-translate-y-3 hover:shadow-xl hover:z-20",
        colorClass
      )}
    >
      {/* Spine detail (Text/Title simulation) */}
      <div className="flex flex-col items-center justify-start pt-2 gap-1 opacity-60">
        <div className="w-[60%] h-[1px] bg-white/40" />
        <div className="w-[60%] h-[1px] bg-white/40" />
        <div className="w-[40%] h-[1px] bg-white/30 mt-1" />
      </div>

      {/* Bottom detail */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <div className="w-1/2 h-2 bg-black/20" />
      </div>

      {/* Side highlight for 3D rounded spine effect */}
      <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-white/20" />
      <div className="absolute top-0 bottom-0 right-0 w-[1px] bg-black/40" />
    </motion.div>
  );
};

const Shelf = ({
  category,
  onClick
}: {
  category: ShelfCategory;
  onClick: () => void;
}) => {
  // Cap at 25, but use accurate count. If 0, show empty shelf.
  const visualBookCount = Math.min(category.count, 25);

  const books = useMemo(() => {
    return Array.from({ length: visualBookCount }).map((_, i) => ({
      height: 75 + Math.random() * 20, // 75-95% height (taller books)
      width: 14 + Math.random() * 10,  // 14-24px width (thicker books)
      color: Math.floor(Math.random() * spineColors.length)
    }));
  }, [category.count]);

  return (
    <div
      className="relative mb-20 group cursor-pointer perspective-1000"
      onClick={onClick}
    >
      {/* Shelf Header/Label - Placed nicely on top */}
      <div className="absolute -top-12 left-6 z-20 flex items-center gap-2">
        <div className="bg-[#f0e6d2] dark:bg-[#3d2e20] px-4 py-2 rounded-md shadow-md border-b-2 border-[#d4c5a9] dark:border-[#2a1f15] transform group-hover:-translate-y-1 transition-transform">
          <span className="font-serif font-bold text-[#5c4033] dark:text-[#d4c5a9] text-lg tracking-wide">{category.name}</span>
          <span className="ml-2 text-xs font-mono text-[#8b6b55] dark:text-[#a08b7d] bg-black/5 dark:bg-black/20 px-1.5 py-0.5 rounded-full">{category.count}</span>
        </div>
      </div>

      {/* Books Container */}
      <div className="relative z-10 flex items-end justify-start px-10 h-44 border-b-[16px] border-[#5d4037] dark:border-[#3e2723] box-border shadow-[0_10px_20px_-5px_rgba(0,0,0,0.4)] bg-gradient-to-b from-transparent to-black/5">
        {books.length > 0 ? (
          books.map((book, i) => (
            <BookSpine
              key={i}
              height={book.height}
              width={book.width}
              colorIndex={book.color}
              delay={i}
            />
          ))
        ) : (
          <div className="w-full text-center pb-4 opacity-30 text-xs italic">Empty Shelf</div>
        )}
        {/* Empty space filler */}
        <div className="flex-1" />
      </div>

      {/* 3D Shelf Front Face (Wood Thickness) */}
      <div className="absolute bottom-[-16px] left-0 right-0 h-4 bg-[#4e342e] dark:bg-[#281a16] shadow-md transform-style-3d">
        <div className="w-full h-full opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)' }}></div>
      </div>

      {/* 3D Shelf Shadow/Depth underneath */}
      <div className="absolute -bottom-10 left-4 right-4 h-6 bg-black/30 blur-lg rounded-[50%]" />

      {/* Back Wall of Shelf */}
      <div className="absolute top-0 bottom-0 left-2 right-2 bg-[#3e2723] dark:bg-[#150d0a] opacity-10 -z-10 rounded-sm box-border border-x border-[#3e2723]/20" />

      {/* Left/Right Panels for depth */}
      <div className="absolute top-0 bottom-[-16px] left-0 w-4 bg-[#4e342e] dark:bg-[#281a16] -skew-y-6 origin-bottom-left shadow-inner z-0" />
      <div className="absolute top-0 bottom-[-16px] right-0 w-4 bg-[#4e342e] dark:bg-[#281a16] skew-y-6 origin-bottom-right shadow-inner z-0" />

    </div>
  );
};

export function Bookshelf3D({ categories, onCategoryClick, className }: Bookshelf3DProps) {
  return (
    <div className={cn("w-full py-12 px-4", className)}>
      <div className="max-w-5xl mx-auto bg-[#fdfbf7] dark:bg-[#1a120b] p-8 md:p-12 rounded-xl border border-[#d7ccc8] dark:border-[#3e2723] shadow-2xl relative overflow-hidden">

        {/* Wood Texture Background Overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")' }}>
        </div>

        {/* Bookshelf Top Frame */}
        <div className="h-6 bg-[#5d4037] dark:bg-[#3e2723] rounded-t-sm mb-10 shadow-lg relative z-20 mx-[-10px]">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        </div>

        {categories.map((cat) => (
          <Shelf
            key={cat.id}
            category={cat}
            onClick={() => onCategoryClick(cat.name)}
          />
        ))}

        {/* Floor/Base of the bookcase */}
        <div className="h-10 bg-[#4e342e] dark:bg-[#251813] rounded-b-sm shadow-2xl relative z-20 mx-[-10px] mt-4 flex items-center justify-center">
          <div className="w-1/3 h-1 bg-black/20 rounded-full blur-[1px]"></div>
        </div>
      </div>
    </div>
  );
}
