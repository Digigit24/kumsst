import ContrastIcon from "@mui/icons-material/Contrast";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import DensitySmallIcon from "@mui/icons-material/DensitySmall";
import FormatTextdirectionRToLIcon from "@mui/icons-material/FormatTextdirectionRToL";
import { ToggleCard } from "./ui/ToggleCard";

import { useSettings } from "@/settings/context/useSettings";
import { useTheme } from "@/contexts/ThemeContext";

export const AppearanceCards = () => {
    const { settings, updateSetting } = useSettings();
    const { theme, setTheme } = useTheme();

    const handleThemeChange = (isDark: boolean) => {
        const newTheme = isDark ? "dark" : "light";
        setTheme(newTheme);
        updateSetting("theme", newTheme);
    };

    return (
        <div className="grid grid-cols-2 gap-4">
            <ToggleCard
                icon={<DarkModeIcon className="icon-theme" />}
                label="Mode"
                checked={theme === "dark"}
                onChange={handleThemeChange}
            />

            <ToggleCard
                icon={<ContrastIcon />}
                label="Contrast"
                checked={settings.contrast}
                onChange={(v) => updateSetting("contrast", v)}
                tooltip="Increase UI contrast"
            />

            <ToggleCard
                icon={<FormatTextdirectionRToLIcon />}
                label="Right to left"
                checked={settings.rtl}
                onChange={(v) => updateSetting("rtl", v)}
                tooltip="Switch layout direction"
            />

            <ToggleCard
                icon={<DensitySmallIcon />}
                label="Compact"
                checked={settings.fontSize === "sm"}
                onChange={(v) => updateSetting("fontSize", v ? "sm" : "md")}
            />
        </div>
    );
};
