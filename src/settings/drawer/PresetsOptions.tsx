import BaseOption from "./BaseOption";
import { SETTINGS_PRESETS } from "@/settings/config/settings.config";
import { useSettings } from "@/settings/context/useSettings";

const PresetsOptions = () => {
    const { applyPreset } = useSettings();

    return (
        <BaseOption
            title="Presets"
            description="Apply a predefined configuration"
        >
            <div className="grid grid-cols-2 gap-2">
                {SETTINGS_PRESETS.map((preset) => (
                    <button
                        key={preset.id}
                        onClick={() => applyPreset(preset)}
                        className="rounded border px-3 py-2 text-xs hover:bg-muted transition"
                    >
                        {preset.label}
                    </button>
                ))}
            </div>
        </BaseOption>
    );
};

export default PresetsOptions;
