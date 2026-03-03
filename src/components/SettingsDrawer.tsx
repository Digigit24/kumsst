import SettingsPanel from "@/settings/drawer/SettingsPanel";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const MIN_WIDTH = 360;
const MAX_WIDTH = 720;
const DEFAULT_WIDTH = 480;

interface SettingsDrawerProps {
    open: boolean;
    onClose: () => void;
}

const SettingsDrawer = ({ open, onClose }: SettingsDrawerProps) => {
    const [isMobile, setIsMobile] = useState(false);
    /* ---------------- MOTION WIDTH (ULTRA SMOOTH) ---------------- */
    const widthMotion = useMotionValue<number>(DEFAULT_WIDTH);
    const smoothWidth = useSpring(widthMotion, {
        stiffness: 240,
        damping: 28,
        mass: 0.9,
    });

    const isResizingRef = useRef<boolean>(false);
    const startXRef = useRef<number>(0);
    const startWidthRef = useRef<number>(DEFAULT_WIDTH);

    /* ---------------- HANDLE RESPONSIVE ---------------- */
    useEffect(() => {
        const updateIsMobile = () => setIsMobile(window.innerWidth < 640);
        updateIsMobile();
        window.addEventListener("resize", updateIsMobile);
        return () => window.removeEventListener("resize", updateIsMobile);
    }, []);

    /* ---------------- RESET WIDTH ON CLOSE ---------------- */
    useEffect(() => {
        if (!open) {
            widthMotion.set(DEFAULT_WIDTH);
        }
    }, [open, widthMotion]);

    /* ---------------- GLOBAL RESIZE HANDLING ---------------- */
    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (!isResizingRef.current) return;
            if (isMobile) return;

            const delta = startXRef.current - e.clientX;
            const next = Math.min(
                MAX_WIDTH,
                Math.max(MIN_WIDTH, startWidthRef.current + delta)
            );

            widthMotion.set(next);
        };

        const onMouseUp = () => {
            if (!isResizingRef.current) return;
            isResizingRef.current = false;
            document.body.style.cursor = "";
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
    }, [widthMotion]);

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* ---------------- BACKDROP ---------------- */}
                    <motion.div
                        className="fixed inset-0 z-40 bg-black/50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* ---------------- DRAWER ---------------- */}
                    <motion.div
                        className="
              fixed top-0 right-0 z-50 h-screen overflow-y-auto
              bg-background/70 backdrop-blur-2xl
              border-l border-white/10
              shadow-[0_0_40px_rgba(0,0,0,0.35)]
            "
                        style={{ width: isMobile ? "100vw" : smoothWidth }}
                        initial={{ x: isMobile ? "100%" : DEFAULT_WIDTH }}
                        animate={{ x: 0 }}
                        exit={{ x: isMobile ? "100%" : DEFAULT_WIDTH }}
                        transition={{ type: "spring", stiffness: 260, damping: 30 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* ---------------- RESIZE HANDLE ---------------- */}
                        {!isMobile && (
                            <div
                                className="
                    absolute left-0 top-0 z-50 h-full w-2 cursor-ew-resize
                    hover:bg-primary/20 transition-colors
                  "
                                onMouseDown={(e) => {
                                    isResizingRef.current = true;
                                    startXRef.current = e.clientX;
                                    startWidthRef.current = widthMotion.get();
                                    document.body.style.cursor = "ew-resize";
                                }}
                            />
                        )}

                        {/* ---------------- HEADER ---------------- */}
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-background/60 backdrop-blur-xl p-4">
                            <h2 className="text-lg font-semibold">Settings</h2>
                            <button
                                onClick={onClose}
                                className="text-sm text-muted-foreground transition hover:text-foreground"
                            >
                                Close
                            </button>
                        </div>

                        {/* ---------------- SETTINGS CONTENT ---------------- */}
                        {/* ---------------- SETTINGS CONTENT ---------------- */}
                        <div className="px-6 py-6">
                            <SettingsPanel drawerWidth={smoothWidth.get()} />
                        </div>

                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SettingsDrawer;
