import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import { AlertTriangle, Banknote, Map, Truck, Users } from 'lucide-react';
import { Circle, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import type { ConstructionProject } from '../../../types/construction.types';

// Fix for default leaflet icons in vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

export function ProjectOverviewTab({ project }: { project: ConstructionProject }) {

    const lat = project.site_latitude ? parseFloat(project.site_latitude) : null;
    const lng = project.site_longitude ? parseFloat(project.site_longitude) : null;
    const radius = project.site_radius_meters || 0;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Column: Key Info & Budget */}
                <div className="space-y-6 md:col-span-1">

                    {/* Budget Card */}
                    <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Banknote className="h-5 w-5 text-emerald-500" /> Budget Overview
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Estimated</span>
                                <span className="font-bold">₹{parseFloat(project.estimated_budget || '0').toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-border pb-2">
                                <span className="text-muted-foreground">Spent</span>
                                <span className="font-bold text-rose-500">₹{parseFloat(String(project.spent || 0)).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="pt-1">
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all"
                                        style={{
                                            width: `${Math.min(100, (Number(project.spent || 0) / Number(project.estimated_budget || 1)) * 100)}%`
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Team Card */}
                    <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-500" /> Assigned Team
                        </h3>
                        <div className="space-y-3">
                            <div className="p-3 bg-muted/50 rounded-lg">
                                <span className="text-xs text-muted-foreground block mb-1">Project Head</span>
                                <p className="text-sm font-medium">{project.project_head_name || 'Not assigned'}</p>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground block mb-2 px-1">Engineers</span>
                                {project.assigned_engineer_names && project.assigned_engineer_names.length > 0 ? (
                                    <div className="flex flex-col gap-2">
                                        {project.assigned_engineer_names.map((name: string, i: number) => (
                                            <div key={i} className="text-sm py-1.5 px-3 border border-border rounded-lg">{name}</div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground px-1">No engineers assigned</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Site Map & Activity placeholder */}
                <div className="space-y-6 md:col-span-2">

                    {/* Map Placeholder or Real Map */}
                    <div className="bg-card border border-border rounded-xl p-1 shadow-sm relative overflow-hidden group">
                        {lat && lng ? (
                            <div className="h-64 w-full rounded-lg overflow-hidden relative z-0">
                                <MapContainer
                                    center={[lat, lng]}
                                    zoom={15}
                                    scrollWheelZoom={false}
                                    style={{ height: '100%', width: '100%' }}
                                    className="z-0"
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <Marker position={[lat, lng]}>
                                        <Popup>
                                            <div className="text-sm font-semibold">{project.project_name}</div>
                                            {project.location_address && (
                                                <div className="text-xs mt-1 mb-1 max-w-[200px]">{project.location_address}</div>
                                            )}
                                            <div className="text-xs text-muted-foreground">Geofence: {radius}m radius</div>
                                        </Popup>
                                    </Marker>
                                    {radius > 0 && (
                                        <Circle
                                            center={[lat, lng]}
                                            radius={radius}
                                            pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
                                        />
                                    )}
                                </MapContainer>
                            </div>
                        ) : (
                            <div className="h-48 w-full bg-muted rounded-lg flex flex-col items-center justify-center relative p-4 text-center">
                                <Map className="h-10 w-10 text-muted-foreground/30 mb-2" />
                                <p className="text-sm text-muted-foreground font-medium">Interactive Site Map</p>
                                {project.location_address ? (
                                    <p className="text-xs text-muted-foreground/70 mt-1 max-w-sm">{project.location_address}</p>
                                ) : (
                                    <p className="text-xs text-muted-foreground/70 mt-1">No GPS coordinates or address set.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Timeline Placeholder */}
                    <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" /> Recent Activity
                        </h3>

                        <div className="space-y-4 pl-2">
                            <div className="relative pl-6 border-l-2 border-muted">
                                <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-card" />
                                <div className="text-sm">
                                    <span className="font-medium text-emerald-600 mb-1 block">Milestone Reached</span>
                                    <p className="text-foreground">Foundation concrete pouring completed.</p>
                                    <span className="text-xs text-muted-foreground mt-1 block">Yesterday</span>
                                </div>
                            </div>

                            <div className="relative pl-6 border-l-2 border-muted">
                                <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-blue-500 ring-4 ring-card" />
                                <div className="text-sm">
                                    <span className="font-medium text-blue-600 mb-1 flex items-center gap-1.5"><Truck className="h-3.5 w-3.5" /> Material Delivered</span>
                                    <p className="text-foreground">500 bags of cement received at site.</p>
                                    <span className="text-xs text-muted-foreground mt-1 block">2 days ago</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
