"use client";

import { useState, useEffect, useCallback, useMemo, createElement } from "react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getFilteredSidebarGroups, SidebarItem, SidebarGroup } from "@/config/sidebar.config";

function useDebounce<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

export interface Action {
    id: string;
    label: string;
    icon: React.ReactNode;
    description?: string;
    short?: string;
    end?: string;
    href?: string;
    group?: string;
}

interface SearchResult {
    actions: Action[];
}

// Color mapping for different groups
const groupColors: Record<string, string> = {
    "Dashboard": "text-blue-500",
    "Core": "text-slate-500",
    "Academic": "text-indigo-500",
    "Students": "text-emerald-500",
    "Teachers": "text-violet-500",
    "Attendance": "text-orange-500",
    "Examinations": "text-red-500",
    "Fees": "text-green-500",
    "Library": "text-amber-500",
    "Hostel": "text-cyan-500",
    "HR": "text-pink-500",
    "Reports": "text-purple-500",
    "Finance": "text-teal-500",
    "Accountant": "text-lime-500",
    "Store": "text-yellow-600",
    "Communication": "text-sky-500",
    "Profile": "text-gray-500",
    "System": "text-zinc-500",
    "Approvals": "text-rose-500",
    "My Academics": "text-blue-400",
    "My Examinations": "text-red-400",
    "My Library": "text-amber-400",
    "My Classes": "text-indigo-400",
    "Assignments": "text-violet-400",
    "Income Dashboard": "text-green-400",
};

// Virtual submodules for tabbed pages (these are tabs within consolidated pages)
const VIRTUAL_SUBMODULES: { parentHref: string; parentName: string; group: string; tabs: { name: string; tab: string; keywords?: string[] }[] }[] = [
    {
        parentHref: "/fees/setup",
        parentName: "Fee Setup",
        group: "Fees",
        tabs: [
            { name: "Fee Types", tab: "types", keywords: ["fee type", "type of fee"] },
            { name: "Fee Groups", tab: "groups", keywords: ["fee group", "group fee"] },
            { name: "Fee Masters", tab: "masters", keywords: ["fee master", "master fee"] },
            { name: "Fee Structures", tab: "structures", keywords: ["fee structure", "structure"] },
            { name: "Fee Installments", tab: "installments", keywords: ["installment", "payment plan"] },
        ]
    },
    {
        parentHref: "/fees/collection",
        parentName: "Fee Collection",
        group: "Fees",
        tabs: [
            { name: "Collections", tab: "collections", keywords: ["fee collection", "collect fee", "payment"] },
            { name: "Bank Payments", tab: "bank", keywords: ["bank", "cheque", "dd", "demand draft"] },
            { name: "Online Payments", tab: "online", keywords: ["online", "gateway", "net banking", "upi"] },
        ]
    },
    {
        parentHref: "/fees/adjustments",
        parentName: "Fee Adjustments",
        group: "Fees",
        tabs: [
            { name: "Discounts", tab: "discounts", keywords: ["discount", "fee discount", "rebate"] },
            { name: "Student Discounts", tab: "student-discounts", keywords: ["student discount", "individual discount"] },
            { name: "Fines", tab: "fines", keywords: ["fine", "late fee", "penalty"] },
            { name: "Refunds", tab: "refunds", keywords: ["refund", "fee refund", "return"] },
        ]
    },
    {
        parentHref: "/fees/reports",
        parentName: "Fee Reports",
        group: "Fees",
        tabs: [
            { name: "Receipts", tab: "receipts", keywords: ["receipt", "fee receipt", "payment receipt"] },
            { name: "Reminders", tab: "reminders", keywords: ["reminder", "fee reminder", "notification"] },
        ]
    },
];

// Flatten sidebar groups into searchable actions
function flattenSidebarToActions(sidebarGroups: SidebarGroup[]): Action[] {
    const actions: Action[] = [];
    let id = 1;

    sidebarGroups.forEach((group: SidebarGroup) => {
        const groupColor = groupColors[group.group] || "text-primary";

        // Process items in the group
        group.items.forEach((item: SidebarItem) => {
            // Skip items with href="#" (container items)
            if (item.href && item.href !== "#") {
                actions.push({
                    id: String(id++),
                    label: item.name,
                    icon: createElement(item.icon, { className: `h-4 w-4 ${groupColor}` }),
                    description: group.group,
                    href: item.href,
                    group: group.group,
                    end: "Navigate",
                });

                // Check if this item has virtual submodules (tabbed pages)
                const virtualModule = VIRTUAL_SUBMODULES.find(vm => vm.parentHref === item.href);
                if (virtualModule) {
                    virtualModule.tabs.forEach((tab) => {
                        actions.push({
                            id: String(id++),
                            label: tab.name,
                            icon: createElement(item.icon, { className: `h-4 w-4 ${groupColor}` }),
                            description: `${group.group} → ${item.name}`,
                            href: `${item.href}?tab=${tab.tab}`,
                            group: group.group,
                            end: "Navigate",
                        });
                    });
                }
            }

            // Process nested items (submodules)
            if (item.items && item.items.length > 0) {
                item.items.forEach((subItem: SidebarItem) => {
                    if (subItem.href && subItem.href !== "#") {
                        actions.push({
                            id: String(id++),
                            label: subItem.name,
                            icon: createElement(subItem.icon, { className: `h-4 w-4 ${groupColor}` }),
                            description: `${group.group} → ${item.name}`,
                            href: subItem.href,
                            group: group.group,
                            end: "Navigate",
                        });
                    }
                });
            }
        });
    });

    return actions;
}

interface ActionSearchBarProps {
    onActionSelect?: (action: Action) => void;
    onClose?: () => void;
    userType?: string;
    userPermissions?: string[];
}

function ActionSearchBar({ onActionSelect, onClose, userType = '', userPermissions = [] }: ActionSearchBarProps) {
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const debouncedQuery = useDebounce(query, 100);
    const navigate = useNavigate();

    // Generate all actions from sidebar config, filtered by user role
    const allActions = useMemo(() => {
        const filteredGroups = getFilteredSidebarGroups(userType, userPermissions);
        return flattenSidebarToActions(filteredGroups);
    }, [userType, userPermissions]);

    // Filter actions based on query
    const filteredActions = useMemo(() => {
        if (!debouncedQuery) {
            // Show first 15 items when no query
            return allActions.slice(0, 15);
        }

        const normalizedQuery = debouncedQuery.toLowerCase().trim();
        const words = normalizedQuery.split(/\s+/);

        return allActions.filter((action) => {
            const searchableText = `${action.label} ${action.description || ''} ${action.group || ''}`.toLowerCase();
            // Match all words in the query
            return words.every(word => searchableText.includes(word));
        }).slice(0, 20); // Limit results
    }, [debouncedQuery, allActions]);

    // Reset selected index when results change
    useEffect(() => {
        setSelectedIndex(0);
    }, [filteredActions]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    };

    const handleActionClick = useCallback((action: Action) => {
        if (onActionSelect) {
            onActionSelect(action);
        }
        if (action.href) {
            navigate(action.href);
        }
        if (onClose) {
            onClose();
        }
    }, [navigate, onActionSelect, onClose]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev =>
                prev < filteredActions.length - 1 ? prev + 1 : 0
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev =>
                prev > 0 ? prev - 1 : filteredActions.length - 1
            );
        } else if (e.key === 'Enter' && filteredActions[selectedIndex]) {
            e.preventDefault();
            handleActionClick(filteredActions[selectedIndex]);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            if (onClose) onClose();
        }
    }, [filteredActions, selectedIndex, handleActionClick, onClose]);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.02,
            },
        },
    };

    const item = {
        hidden: { opacity: 0, x: -10 },
        show: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.1,
            },
        },
    };

    return (
        <div className="w-full">
            <div className="relative">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search pages, modules..."
                        value={query}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        className="pl-9 pr-9 py-2 h-11 text-base rounded-lg border-muted-foreground/20 focus-visible:ring-1 focus-visible:ring-primary"
                    />
                    <AnimatePresence mode="popLayout">
                        {query.length > 0 && (
                            <motion.div
                                key="send"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                                <Send className="w-4 h-4 text-primary" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="mt-2 max-h-[350px] overflow-y-auto">
                <AnimatePresence mode="wait">
                    {filteredActions.length > 0 ? (
                        <motion.div
                            variants={container}
                            initial="hidden"
                            animate="show"
                            key={debouncedQuery}
                        >
                            {!debouncedQuery && (
                                <p className="text-xs text-muted-foreground px-3 py-1.5">Quick Access</p>
                            )}
                            {debouncedQuery && (
                                <p className="text-xs text-muted-foreground px-3 py-1.5">
                                    {filteredActions.length} result{filteredActions.length !== 1 ? 's' : ''} found
                                </p>
                            )}
                            <motion.ul className="space-y-0.5">
                                {filteredActions.map((action, index) => (
                                    <motion.li
                                        key={action.id}
                                        variants={item}
                                        className={`px-3 py-2 flex items-center justify-between cursor-pointer rounded-lg transition-colors ${
                                            index === selectedIndex
                                                ? 'bg-primary/10 border border-primary/20'
                                                : 'hover:bg-muted'
                                        }`}
                                        onClick={() => handleActionClick(action)}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                    >
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <span className="flex-shrink-0">
                                                {action.icon}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <span className="text-sm font-medium text-foreground block truncate">
                                                    {action.label}
                                                </span>
                                                {action.description && (
                                                    <span className="text-xs text-muted-foreground block truncate">
                                                        {action.description}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                                            {action.end}
                                        </span>
                                    </motion.li>
                                ))}
                            </motion.ul>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-8 text-center text-muted-foreground"
                        >
                            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No results found for "{query}"</p>
                            <p className="text-xs mt-1">Try searching for "students", "fees", "attendance"...</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">↑↓</kbd>
                            Navigate
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">↵</kbd>
                            Select
                        </span>
                    </div>
                    <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">ESC</kbd>
                        Close
                    </span>
                </div>
            </div>
        </div>
    );
}

export { ActionSearchBar };
export type { Action as ActionSearchBarAction };
