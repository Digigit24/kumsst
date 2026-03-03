import { useSettings } from "@/settings/context/useSettings";
import clsx from "clsx";

const COLORS = [
    "#6366f1",
    "#8b5cf6",
    "#22c55e",
    "#ef4444",
    "#0ea5e9",
];

export const ColorOptions = () => {
    const { settings, updateSetting } = useSettings();

    return (
        <div className="space-y-3">
            <div className="text-xs font-medium text-muted-foreground">
                Primary color
            </div>

            <div className="flex gap-3 flex-wrap">
                {COLORS.map((color) => {
                    const active = settings.primaryColor === color;

                    return (
                        <button
                            key={color}
                            onClick={() => updateSetting("primaryColor", color)}
                            className={clsx(
                                "relative h-8 w-8 rounded-full transition-all",
                                "ring-offset-background ring-offset-2",
                                active
                                    ? "ring-2 ring-primary shadow-lg scale-105"
                                    : "hover:scale-105"
                            )}
                            style={{
                                backgroundColor: color,
                                opacity:
                                    settings.colorMode === "integrate" ? 0.85 : 1,
                            }}
                        >
                            {active && (
                                <span className="absolute inset-0 rounded-full bg-white/20" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
