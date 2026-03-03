
import { cn } from '@/lib/utils';
import React, { useCallback, useEffect, useRef, useState } from 'react';

export interface TetrisLoaderProps {
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Animation speed variant */
    speed?: 'slow' | 'normal' | 'fast';
    /** Custom class for the container */
    className?: string;
    /** Primary color for the active block (Tailwind class) */
    activeColor?: string;
    /** Color for settled blocks (Tailwind class) */
    settledColor?: string;
    /** Grid background color (Tailwind class) */
    gridColor?: string;
}

// ----------------------------------------------------------------------------
// Constants & Types
// ----------------------------------------------------------------------------
const COLS = 4;
const ROWS = 6;

// Size configurations
const SIZE_CONFIG = {
    sm: { blockSize: 'w-3 h-3', gap: 'gap-0.5', container: 'p-1' },
    md: { blockSize: 'w-5 h-5', gap: 'gap-1', container: 'p-2' },
    lg: { blockSize: 'w-8 h-8', gap: 'gap-1.5', container: 'p-3' },
};

// Speed configurations (ms per tick)
const SPEED_CONFIG = {
    slow: 300,
    normal: 150,
    fast: 80,
};

// Block shapes (simplified for a 4-wide grid)
// Each shape is an array of [r, c] offsets from a pivot
const SHAPES = [
    [[0, 0], [0, 1], [0, 2], [0, 3]], // I
    [[0, 0], [0, 1], [1, 0], [1, 1]], // O
    [[0, 0], [0, 1], [0, 2], [1, 1]], // T
    [[0, 0], [1, 0], [2, 0], [2, 1]], // L
    [[0, 1], [1, 1], [2, 1], [2, 0]], // J
];

type GridState = (string | null)[][]; // null = empty, string = color class

const TetrisLoader: React.FC<TetrisLoaderProps> = ({
    size = 'md',
    speed = 'normal',
    className,
    activeColor = 'bg-primary',
    settledColor = 'bg-primary/50',
    gridColor = 'bg-muted/20',
}) => {
    // --------------------------------------------------------------------------
    // State
    // --------------------------------------------------------------------------
    const [grid, setGrid] = useState<GridState>(
        Array.from({ length: ROWS }, () => Array(COLS).fill(null))
    );

    // Active block state
    const activeBlockRef = useRef<{
        shape: number[][]; // current shape coordinates relative to pivot
        row: number;
        col: number;
        color: string;
    } | null>(null);

    // To trigger re-renders when active block moves (since refs don't trigger render)
    const [, setTick] = useState(0);

    // --------------------------------------------------------------------------
    // Game Logic Helpers
    // --------------------------------------------------------------------------

    // Check if a block position is valid
    const isValid = (r: number, c: number, currentGrid: GridState) => {
        return (
            r >= 0 &&
            r < ROWS &&
            c >= 0 &&
            c < COLS &&
            currentGrid[r][c] === null
        );
    };

    // Check if the current active block can be placed at (r, c)
    const canPlace = (r: number, c: number, shape: number[][], currentGrid: GridState) => {
        return shape.every(([dr, dc]) => isValid(r + dr, c + dc, currentGrid));
    };

    // Spawn a new block
    const spawnBlock = useCallback(() => {
        const shapeIdx = Math.floor(Math.random() * SHAPES.length);
        const shape = SHAPES[shapeIdx];
        // Start at top, centered-ish
        const startRow = 0;
        const startCol = Math.floor((COLS - 2) / 2);

        // If we can't spawn, clear grid (loop)
        // We pass 'grid' from state closure here, but for 'canPlace' we might need latest.
        // However, inside the loop we'll rely on the ref implementation mostly.

        return {
            shape,
            row: startRow,
            col: startCol,
            color: activeColor,
        };
    }, [activeColor]);

    // --------------------------------------------------------------------------
    // Game Loop
    // --------------------------------------------------------------------------
    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;

        const tick = () => {
            setGrid((prevGrid) => {
                let nextGrid = prevGrid.map((row) => [...row]);
                let active = activeBlockRef.current;

                // 1. If currently clearing (full), wait one tick then reset
                // (Simple version: just reset if full)
                const isFull = prevGrid[0].some(cell => cell !== null) || prevGrid[1].some(cell => cell !== null);
                if (isFull && !active) {
                    // Reset grid
                    activeBlockRef.current = null;
                    return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
                }

                // 2. If no active block, spawn one
                if (!active) {
                    const newBlock = spawnBlock();
                    if (canPlace(newBlock.row, newBlock.col, newBlock.shape, nextGrid)) {
                        activeBlockRef.current = newBlock;
                        setTick(t => t + 1); // Force render
                        return nextGrid;
                    } else {
                        // Cannot spawn -> Game Over -> Reset immediate
                        activeBlockRef.current = null;
                        return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
                    }
                }

                // 3. Try to move active block down
                if (active) {
                    const nextRow = active.row + 1;
                    if (canPlace(nextRow, active.col, active.shape, nextGrid)) {
                        // Move down
                        active.row = nextRow;
                        activeBlockRef.current = active; // Update ref
                        setTick(t => t + 1);
                        return nextGrid;
                    } else {
                        // Cannot move down -> Lock it
                        active.shape.forEach(([dr, dc]) => {
                            const r = active!.row + dr;
                            const c = active!.col + dc;
                            if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
                                nextGrid[r][c] = settledColor;
                            }
                        });
                        activeBlockRef.current = null;

                        // Check for line clears (optional for a loader, but looks cool)
                        // Simplified: if a row is full, clear it and move everything down? 
                        // For a loader, maybe just filling up is enough. 
                        // Let's toggle: if top row is reached, we already reset effectively in next tick.

                        return nextGrid;
                    }
                }

                return nextGrid;
            });

            timeoutId = setTimeout(tick, SPEED_CONFIG[speed]);
        };

        tick();
        return () => clearTimeout(timeoutId);
    }, [speed, spawnBlock, settledColor]);


    // --------------------------------------------------------------------------
    // Render
    // --------------------------------------------------------------------------
    const { blockSize, gap, container } = SIZE_CONFIG[size];

    // Helper to determine cell color for rendering
    const getCellColor = (r: number, c: number) => {
        // 1. Check active block
        if (activeBlockRef.current) {
            const { row, col, shape, color } = activeBlockRef.current;
            const isPart = shape.some(([dr, dc]) => row + dr === r && col + dc === c);
            if (isPart) return color;
        }
        // 2. Check grid state
        return grid[r][c];
    };

    return (
        <div className={cn("inline-block rounded-md bg-muted/10 border border-border shadow-sm", container, className)}>
            <div className={cn("grid", gap)} style={{ gridTemplateColumns: `repeat(${COLS}, min-content)` }}>
                {Array.from({ length: ROWS }).map((_, r) =>
                    Array.from({ length: COLS }).map((_, c) => {
                        const color = getCellColor(r, c);
                        return (
                            <div
                                key={`${r}-${c}`}
                                className={cn(
                                    "rounded-sm transition-colors duration-100",
                                    blockSize,
                                    color ? color : gridColor
                                )}
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default TetrisLoader;
