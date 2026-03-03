import BaseOption from "./BaseOption";
import { useSettings } from "@/settings/context/useSettings";
import { FontSize } from "@/settings/types/settings.types";

const OPTIONS: { label: string; value: FontSize }[] = [
    { label: "Small", value: "sm" },
    { label: "Medium", value: "md" },
    { label: "Large", value: "lg" },
];

const FontOptions = () => {
    const { settings, updateSetting } = useSettings();

    return (
        <BaseOption
            title="Font Size"
            description="Adjust application typography scale"
        >
            <div className="flex gap-2">
                {OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => updateSetting("fontSize", opt.value)}
                        className={`px-3 py-1.5 rounded text-xs border transition
              ${settings.fontSize === opt.value
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

export default FontOptions;
