import BaseOption from "./BaseOption";
import { useSettings } from "@/settings/context/useSettings";
import { NavigationMode } from "@/settings/types/settings.types";

const OPTIONS: { label: string; value: NavigationMode }[] = [
    { label: "Sidebar", value: "side" },
    { label: "Top Bar", value: "top" },
];

const NavOptions = () => {
    const { settings, updateSetting } = useSettings();

    return (
        <BaseOption
            title="Navigation Layout"
            description="Choose how navigation is displayed"
        >
            <div className="flex gap-2">
                {OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => updateSetting("navigation", opt.value)}
                        className={`px-3 py-1.5 rounded text-xs border transition
              ${settings.navigation === opt.value
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted"
                            }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </BaseOption>
    );
};

export default NavOptions;
