import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import clsx from "clsx";
import React from "react";

interface ToggleCardProps {
    icon: React.ReactNode;
    label: string;
    checked: boolean;
    onChange: (val: boolean) => void;
    tooltip?: string;
}

export const ToggleCard = ({
    icon,
    label,
    checked,
    onChange,
    tooltip,
}: ToggleCardProps) => {
    return (
        <Card
            className={clsx(
                "relative p-4 h-[110px] rounded-xl transition-all",
                "bg-white/5 backdrop-blur-xl border border-white/10",
                checked && "ring-1 ring-emerald-500/40 shadow-emerald-500/20"
            )}
        >
            <div className="flex justify-between items-start">
                {/* 🔥 ICON – FORCE COLOR INTO SVG */}
                <div>
                    {React.isValidElement(icon) &&
                        React.cloneElement(icon as React.ReactElement, {
                            className: clsx(
                                "transition-colors",
                                checked ? "text-primary" : "text-muted-foreground"
                            ),
                        })}
                </div>

                <Switch checked={checked} onCheckedChange={onChange} />
            </div>

            <div className="absolute bottom-4 left-4 text-sm font-medium flex items-center gap-1">
                {label}
                {tooltip && (
                    <Tooltip>
                        <TooltipTrigger className="text-muted-foreground">
                            ⓘ
                        </TooltipTrigger>
                        <TooltipContent>{tooltip}</TooltipContent>
                    </Tooltip>
                )}
            </div>
        </Card>
    );
};
