// import BaseOption from "./BaseOption";
// import { useSettings } from "@/settings/context/useSettings";
// import { ThemeMode } from "@/settings/types/settings.types";

// const MODES: { label: string; value: ThemeMode }[] = [
//     { label: "Light", value: "light" },
//     { label: "Dark", value: "dark" },
//     { label: "System", value: "system" },
// ];

// const ThemeOptions = () => {
//     const { settings, updateSetting } = useSettings();

//     return (
//         <BaseOption
//             title="Theme Mode"
//             description="Switch between light, dark or system theme"
//         >
//             <div className="flex gap-2">
//                 {MODES.map((mode) => (
//                     <button
//                         key={mode.value}
//                         onClick={() => updateSetting("theme", mode.value)}
//                         className={`px-3 py-1.5 rounded text-xs border transition
//               ${settings.theme === mode.value
//                                 ? "bg-primary text-primary-foreground"
//                                 : "hover:bg-muted"
//                             }`}
//                     >
//                         {mode.label}
//                     </button>
//                 ))}
//             </div>
//         </BaseOption>
//     );
// };

// export default ThemeOptions;
