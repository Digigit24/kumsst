import logo from "@/assets/app_logo-removebg-preview.png"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getFilteredSidebarGroups } from "@/config/sidebar.config"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { Link, useLocation } from "react-router-dom"

const GLASS_STYLES = {
  container: cn(
    "bg-white/80 dark:bg-gray-950/80",
    "backdrop-blur-2xl backdrop-saturate-200",
    "border-r border-white/30 dark:border-white/[0.08]",
    "shadow-xl shadow-black/[0.03]",
    "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]",
    "from-white/90 via-white/80 to-white/70",
    "dark:from-gray-950/90 dark:via-gray-950/80 dark:to-gray-900/70"
  ),
  groupButton: cn(
    "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium",
    "hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent",
    "dark:hover:from-primary/20 dark:hover:to-transparent",
    "transition-all duration-300 ease-out rounded-xl",
    "backdrop-blur-sm",
    "group relative overflow-hidden",
    "before:absolute before:inset-0 before:bg-gradient-to-r",
    "before:from-transparent before:via-white/20 before:to-transparent",
    "before:translate-x-[-200%] hover:before:translate-x-[200%]",
    "before:transition-transform before:duration-700"
  ),
  navLink: cn(
    "flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl",
    "hover:bg-gradient-to-r hover:from-primary/[0.08] hover:to-primary/[0.03]",
    "dark:hover:from-primary/20 dark:hover:to-primary/10",
    "hover:shadow-md hover:shadow-primary/5 hover:scale-[1.01]",
    "hover:translate-x-0.5",
    "transition-all duration-300 ease-out",
    "backdrop-blur-sm relative group"
  ),
  navLinkActive: cn(
    "bg-gradient-to-r from-primary/15 to-primary/5",
    "dark:from-primary/25 dark:to-primary/15",
    "text-primary font-medium shadow-lg shadow-primary/10",
    "border border-primary/20 dark:border-primary/30",
    "scale-[1.01]"
  )
}

// import { useNotificationWebSocket } from "@/hooks/useNotificationWebSocket"
import { useModulePrefetcher } from "@/hooks/useModulePrefetcher"
import { toast } from "sonner"

export const Sidebar = React.memo(({ onNavigate }: { onNavigate?: () => void }) => {
  const location = useLocation()
  const { user, token } = useAuth()
  const prefetchModule = useModulePrefetcher()

  // Notification Socket - Disabled in favor of Long Polling
  // const { notifications } = useNotificationWebSocket(token);
  const notifications: any[] = []; // Placeholder 
  const [lastNotifId, setLastNotifId] = useState<number | null>(null);

  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[notifications.length - 1];
      if (latest.id !== lastNotifId) {
        const title = latest.title || "New Notification";
        const desc = latest.message || "You have a new update.";
        toast.info(title, { description: desc });
        setLastNotifId(latest.id);
      }
    }
  }, [notifications, lastNotifId]);


  // Parse stored user once for both userType and userPermissions
  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('kumss_user') || '{}')
    } catch {
      return {}
    }
  }, [user])

  const userType = useMemo(() => {
    if (user?.user_type) return user.user_type
    return storedUser.user_type || storedUser.userType || 'student'
  }, [user, storedUser])

  const userPermissions = useMemo(() => {
    if (user?.permissions && Array.isArray(user.permissions)) {
      return user.permissions
    }
    if (storedUser.permissions && Array.isArray(storedUser.permissions)) {
      return storedUser.permissions
    }
    return []
  }, [user, storedUser])

  // Filter sidebar groups based on user type AND permissions
  const filteredGroups = useMemo(() => {
    return getFilteredSidebarGroups(userType, userPermissions)
  }, [userType, userPermissions])

  // Determine panel title based on user type
  const panelTitle = useMemo(() => {
    return 'EduSphere'
  }, [])

  // Lazy-init openGroup from the current route so the correct group is
  // already expanded when the sidebar mounts (or remounts after mobile close)
  const [openGroup, setOpenGroup] = useState<string | null>(() => {
    return filteredGroups.find(group =>
      group.items.some(item =>
        location.pathname === item.href ||
        item.items?.some(sub => location.pathname === sub.href)
      )
    )?.group ?? null
  })

  // Lazy-init openSubMenus so the active sub-menu is also open on mount
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>(() => {
    const result: Record<string, boolean> = {}
    for (const group of filteredGroups) {
      for (const item of group.items) {
        if (item.items?.some(sub => location.pathname === sub.href)) {
          result[item.name] = true
        }
      }
    }
    return result
  })

  const [isCollapsed, setIsCollapsed] = useState(false)
  const [openPopover, setOpenPopover] = useState<string | null>(null)

  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // After mount, scroll the active nav item into view inside the ScrollArea
  useEffect(() => {
    const timer = setTimeout(() => {
      const activeEl = scrollAreaRef.current?.querySelector<HTMLElement>('[data-active="true"]')
      activeEl?.scrollIntoView({ block: 'nearest', behavior: 'instant' })
    }, 80)
    return () => clearTimeout(timer)
  }, []) // Only on mount / remount

  const toggleSubMenu = (name: string) => {
    setOpenSubMenus(prev => ({ ...prev, [name]: !prev[name] }))
  }

  return (
    <TooltipProvider delayDuration={300}>
      <aside
        className={cn(
          "h-screen flex flex-col border-r overflow-hidden transition-all duration-300 pt-4",
          GLASS_STYLES.container,
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header with Collapse Toggle */}
        <div className={cn(
          "p-4 flex items-center border-b border-white/30 dark:border-white/[0.08]",
          "backdrop-blur-sm bg-white/40 dark:bg-white/[0.02]",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="KUMSS Edusphere"
                className="h-16 w-auto rounded-md border border-white/40 dark:border-white/10 shadow-sm"
              />
              <h2 className="font-bold text-xl bg-gradient-to-br from-primary via-primary to-purple-600 bg-clip-text text-transparent animate-in fade-in duration-300">
                {panelTitle}
              </h2>
            </div>
          ) : (
            <img
              src={logo}
              alt="KUMSS Edusphere"
              className="h-12 w-auto rounded-md border border-white/40 dark:border-white/10 shadow-sm"
            />
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-xl",
                  "hover:bg-gradient-to-br hover:from-primary/10 hover:to-purple-500/10",
                  "dark:hover:from-primary/20 dark:hover:to-purple-500/20",
                  "hover:shadow-lg hover:shadow-primary/20",
                  "transition-all duration-300 hover:scale-110 active:scale-95"
                )}
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? (
                  <ChevronsRight className="h-4 w-4 transition-transform" />
                ) : (
                  <ChevronsLeft className="h-4 w-4 transition-transform" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-gradient-to-r from-primary to-purple-600 text-white border-0">
              {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 [&>[data-radix-scroll-area-viewport]>div]:!block">
          <div ref={scrollAreaRef} className={cn("space-y-1 pb-40", isCollapsed ? "p-2" : "p-4")}>
            {filteredGroups.map((group) => {
              const GroupIcon = group.icon
              const isOpen = openGroup === group.group
              const isSingleSelfNamed = group.items.length === 1 && group.items[0].name === group.group

              return (
                <div key={group.group}>
                  {isSingleSelfNamed ? (
                    // Render single self-named item as a simple link (no nested duplicate label)
                    <Link
                      to={group.items[0].href}
                      data-active={location.pathname === group.items[0].href ? "true" : undefined}
                      onClick={() => {
                        onNavigate?.();
                      }}
                      className={cn(
                        GLASS_STYLES.navLink,
                        location.pathname === group.items[0].href && GLASS_STYLES.navLinkActive,
                        isCollapsed ? "justify-center px-0" : ""
                      )}
                    >
                      <GroupIcon className="h-5 w-5 transition-all group-hover:scale-110" />
                      {!isCollapsed && <span className="truncate">{group.items[0].name}</span>}
                    </Link>
                  ) : isCollapsed ? (
                    // Collapsed state - Show popover on click
                    <Popover open={openPopover === group.group} onOpenChange={(open) => setOpenPopover(open ? group.group : null)}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <PopoverTrigger asChild>
                            <button
                              className={cn(
                                GLASS_STYLES.groupButton,
                                "justify-center px-0"
                              )}
                            >
                              <GroupIcon className="h-5 w-5 transition-all group-hover:scale-110 group-hover:text-primary" />
                            </button>
                          </PopoverTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{group.group}</p>
                        </TooltipContent>
                      </Tooltip>

                      <PopoverContent
                        side="right"
                        align="start"
                        sideOffset={8}
                        className={cn(
                          "w-64 p-2",
                          "bg-white/90 dark:bg-gray-950/90",
                          "backdrop-blur-2xl backdrop-saturate-200",
                          "border border-white/30 dark:border-white/10",
                          "shadow-2xl shadow-black/10",
                          "rounded-xl",
                          "animate-in slide-in-from-left-2 fade-in duration-200"
                        )}
                      >
                        <div className="space-y-1">
                          {/* Popover Header */}
                          <div className="px-3 py-2 mb-2 border-b border-white/20 dark:border-white/10">
                            <div className="flex items-center gap-2">
                              <GroupIcon className="h-4 w-4 text-primary" />
                              <h3 className="font-semibold text-sm">{group.group}</h3>
                            </div>
                          </div>

                          {/* Popover Items */}
                          {group.items.map((item) => {
                            const Icon = item.icon
                            const active = location.pathname === item.href

                            // Handler for nested items in popover
                            if (item.items && item.items.length > 0) {
                              return (
                                <div key={item.name} className="space-y-1 my-1">
                                  <div className="px-3 py-1 flex items-center gap-2 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                                    <Icon className="h-3 w-3" />
                                    <span>{item.name}</span>
                                  </div>
                                  {item.items.map((subItem) => {
                                    const SubIcon = subItem.icon
                                    const subActive = location.pathname === subItem.href
                                    return (
                                      <Link
                                        key={subItem.name}
                                        to={subItem.href}
                                        onClick={() => {
                                          setOpenPopover(null);
                                          onNavigate?.();
                                        }}
                                        className={cn(
                                          "flex items-center gap-3 px-3 py-2 text-sm rounded-lg ml-2", // Indented
                                          "hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5",
                                          "dark:hover:from-primary/20 dark:hover:to-primary/10",
                                          "transition-all duration-200",
                                          subActive && cn(
                                            "bg-gradient-to-r from-primary/15 to-primary/5",
                                            "text-primary font-medium"
                                          )
                                        )}
                                      >
                                        <SubIcon className="h-3.5 w-3.5" />
                                        <span className="truncate">{subItem.name}</span>
                                      </Link>
                                    )
                                  })}
                                </div>
                              )
                            }

                            return (
                              <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => {
                                  setOpenPopover(null);
                                  onNavigate?.();
                                }}
                                className={cn(
                                  "flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg",
                                  "hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5",
                                  "dark:hover:from-primary/20 dark:hover:to-primary/10",
                                  "hover:shadow-sm hover:translate-x-0.5",
                                  "transition-all duration-200",
                                  "group",
                                  active && cn(
                                    "bg-gradient-to-r from-primary/15 to-primary/5",
                                    "dark:from-primary/25 dark:to-primary/15",
                                    "text-primary font-medium shadow-md shadow-primary/10",
                                    "border border-primary/20"
                                  )
                                )}
                              >
                                <Icon className="h-4 w-4 transition-all flex-shrink-0 group-hover:scale-110" />
                                <span className="truncate">{item.name}</span>
                              </Link>
                            )
                          })}
                        </div>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    // Expanded state - Normal behavior
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => {
                            const newOpenState = isOpen ? null : group.group
                            setOpenGroup(newOpenState)
                            if (newOpenState) {
                              prefetchModule(group.group)
                            }
                          }}
                          className={GLASS_STYLES.groupButton}
                        >
                          <GroupIcon className="h-5 w-5 transition-all group-hover:scale-110 group-hover:text-primary" />
                          <span className="flex-1 text-left font-medium">
                            {group.group}
                          </span>
                          {isOpen ? (
                            <ChevronDown className="h-4 w-4 transition-transform" />
                          ) : (
                            <ChevronRight className="h-4 w-4 transition-transform" />
                          )}
                        </button>
                      </TooltipTrigger>
                    </Tooltip>
                  )}

                  {isOpen && !isCollapsed && !isSingleSelfNamed && (
                    <div className="ml-8 space-y-0.5 mt-1 animate-in slide-in-from-top-2 duration-200">
                      {group.items.map((item) => {
                        const Icon = item.icon
                        const active = location.pathname === item.href

                        // Handler for nested items in expanded sidebar
                        if (item.items && item.items.length > 0) {
                          const isSubOpen = openSubMenus[item.name]
                          const hasActiveChild = item.items.some(sub => location.pathname === sub.href)

                          return (
                            <div key={item.name} className="space-y-0.5">
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  toggleSubMenu(item.name)
                                }}
                                className={cn(
                                  GLASS_STYLES.navLink,
                                  "w-full justify-between pr-2",
                                  hasActiveChild && "text-primary font-medium bg-primary/5"
                                )}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <Icon className="h-4 w-4 transition-all flex-shrink-0" />
                                  <span className="truncate">{item.name}</span>
                                </div>
                                {isSubOpen ? (
                                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                                ) : (
                                  <ChevronRight className="h-3.5 w-3.5 opacity-70" />
                                )}
                              </button>

                              {isSubOpen && (
                                <div className="ml-4 pl-3 border-l border-primary/20 space-y-0.5 animate-in slide-in-from-top-1 duration-200">
                                  {item.items.map((subItem) => {
                                    const SubIcon = subItem.icon
                                    const subActive = location.pathname === subItem.href
                                    return (
                                      <Link
                                        key={subItem.name}
                                        to={subItem.href}
                                        data-active={subActive ? "true" : undefined}
                                        onClick={() => onNavigate?.()}
                                        className={cn(
                                          GLASS_STYLES.navLink,
                                          "py-2 text-xs", // Smaller for subsections
                                          subActive && GLASS_STYLES.navLinkActive
                                        )}
                                      >
                                        <SubIcon className="h-3.5 w-3.5 transition-all flex-shrink-0 group-hover:scale-110" />
                                        <span className="transition-all truncate">
                                          {subItem.name}
                                        </span>
                                      </Link>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          )
                        }

                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            data-active={active ? "true" : undefined}
                            onClick={() => onNavigate?.()}
                            className={cn(
                              GLASS_STYLES.navLink,
                              active && GLASS_STYLES.navLinkActive
                            )}
                          >
                            <Icon className="h-4 w-4 transition-all flex-shrink-0 group-hover:scale-110" />
                            <span className="transition-all truncate">
                              {item.name}
                            </span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </aside>
    </TooltipProvider>
  )
})
