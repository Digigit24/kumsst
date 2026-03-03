import BaseOption from "./BaseOption";
import { useSettings } from "@/settings/context/useSettings";

const ResetOption = () => {
    const { resetSettings } = useSettings();

    return (
        <BaseOption
            title="Reset Settings"
            description="Restore default configuration"
        >
            <button
                onClick={resetSettings}
                className="text-xs px-3 py-2 rounded border hover:bg-destructive hover:text-destructive-foreground transition"
            >
                Reset to Default
            </button>
        </BaseOption>
    );
};

export default ResetOption;
