import { Separator } from "@/components/ui/separator";

import { ColorOptions } from "@/settings/drawer/ColorOptions";

import FontOptions from "./FontOptions";
import FullscreenButton from "./FullscreenButton";

import { AppearanceCards } from "./AppearanceCards";
import { NavLayoutSection } from "./NavLayoutSection";
import PresetsOptions from "./PresetsOptions";
import ResetOption from "./ResetOption";
// import ThemeOptions from "./ThemeOptions";
interface SettingsPanelProps {
    drawerWidth: number;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ drawerWidth }) => {
    return (
        <div className="pb-10">


            <AppearanceCards />
            <Separator />
            <NavLayoutSection />
            <PresetsOptions />
            {/* <ThemeOptions /> */}
            <ColorOptions />
            <FontOptions />
            {/* <NavOptions /> */}
            <FullscreenButton />
            <ResetOption />
        </div>
    );
};

export default SettingsPanel;
