import BaseOption from "./BaseOption";
import { useSettings } from "@/settings/context/useSettings";

const FullscreenButton = () => {
    const { settings, updateSetting } = useSettings();

    const toggleFullscreen = async () => {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
            updateSetting("fullscreen", true);
        } else {
            await document.exitFullscreen();
            updateSetting("fullscreen", false);
        }
    };

    return (
        <BaseOption
            title="Fullscreen"
            description="Toggle immersive mode"
        >
            <button
                onClick={toggleFullscreen}
                className="rounded border px-3 py-2 text-xs hover:bg-muted transition"
            >
                {settings.fullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            </button>
        </BaseOption>
    );
};

export default FullscreenButton;
