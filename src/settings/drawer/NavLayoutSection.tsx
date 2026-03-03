import { useSettings } from "@/settings/context/useSettings";

export const NavLayoutSection = () => {
    const {  } = useSettings();

    return (
        <></>
        // <div className="space-y-3">
        //     <div className="text-xs font-medium text-muted-foreground">Layout</div>

        //     <div className="grid grid-cols-3 gap-3">
        //         <LayoutPreviewCard
        //             active={settings.navigation === "side"}
        //             onClick={() => updateSetting("navigation", "side")}
        //         >
        //             <SidebarPreview />
        //         </LayoutPreviewCard>

        //         <LayoutPreviewCard
        //             active={settings.navigation === "top"}
        //             onClick={() => updateSetting("navigation", "top")}
        //         >
        //             <TopbarPreview />
        //         </LayoutPreviewCard>

        //         <LayoutPreviewCard
        //             active={settings.navigation === "compact"}
        //             onClick={() => updateSetting("navigation", "compact")}
        //         >
        //             <CompactPreview />
        //         </LayoutPreviewCard>
        //     </div>
        // </div>
    );
};
