import { Card } from "@/components/ui/card";
import clsx from "clsx";

interface LayoutPreviewCardProps {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}

export const LayoutPreviewCard = ({
    active,
    onClick,
    children,
}: LayoutPreviewCardProps) => {
    return (
        <Card
            onClick={onClick}
            className={clsx(
                "relative h-[90px] cursor-pointer rounded-xl p-2 transition-all",
                "bg-white/5 backdrop-blur-xl border border-white/10",
                active
                    ? "ring-1 ring-emerald-500/50 shadow-emerald-500/20"
                    : "hover:bg-white/10"
            )}
        >
            {children}
        </Card>
    );
};
