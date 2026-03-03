import { useEffect, useState } from "react";
import { roleApi } from "@/services/accounts.service";
import { RoleTree as RoleNode } from "@/types/accounts.types";
import { RoleTree } from "./components/RoleTree";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus, Network, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const RoleHierarchyPage = () => {
    const [tree, setTree] = useState<RoleNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [usingMock, setUsingMock] = useState(false);

    const fetchTree = async () => {
        setLoading(true);
        setError(null);
        setUsingMock(false);
        try {
            const data = await roleApi.getTree();
            setTree(data.tree);
        } catch (err: any) {
            // Mock Data structure for demonstration
            const mockTree: RoleNode[] = [
                 {
                    id: 9991, college: 1, college_name: "Demo College", name: "Principal", code: "PRINCIPAL", description: "Head of Institution",
                    display_order: 0, is_active: true, created_by_name: "System", updated_by_name: null, created_at: "", updated_at: "", permissions: {},
                    level: 0, parent: null, parent_name: null, is_organizational_position: true,
                    children: [
                        {
                            id: 9992, college: 1, college_name: "Demo College", name: "Vice Principal", code: "VP", description: "Deputy Head",
                            display_order: 1, is_active: true, created_by_name: "System", updated_by_name: null, created_at: "", updated_at: "", permissions: {},
                            level: 1, parent: 9991, parent_name: "Principal", is_organizational_position: true,
                            children: [
                                {
                                    id: 9993, college: 1, college_name: "Demo College", name: "Academic Coordinator", code: "ACAD_COORD", description: "",
                                    display_order: 0, is_active: true, created_by_name: "System", updated_by_name: null, created_at: "", updated_at: "", permissions: {},
                                    level: 2, parent: 9992, parent_name: "Vice Principal", is_organizational_position: true,
                                    children: []
                                }
                            ]
                        },
                        {
                            id: 9994, college: 1, college_name: "Demo College", name: "HOD - Computer Science", code: "HOD_CS", description: "Dept Head",
                            display_order: 2, is_active: true, created_by_name: "System", updated_by_name: null, created_at: "", updated_at: "", permissions: {},
                            level: 1, parent: 9991, parent_name: "Principal", is_organizational_position: true,
                            children: [
                                {
                                    id: 9995, college: 1, college_name: "Demo College", name: "Class Coordinator - CS", code: "CC_CS", description: "",
                                    display_order: 0, is_active: true, created_by_name: "System", updated_by_name: null, created_at: "", updated_at: "", permissions: {},
                                    level: 2, parent: 9994, parent_name: "HOD - Computer Science", is_organizational_position: true,
                                    children: [
                                         {
                                            id: 9996, college: 1, college_name: "Demo College", name: "Teacher", code: "TEACHER", description: "",
                                            display_order: 0, is_active: true, created_by_name: "System", updated_by_name: null, created_at: "", updated_at: "", permissions: {},
                                            level: 3, parent: 9995, parent_name: "Class Coordinator - CS", is_organizational_position: false,
                                            children: []
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                 }
            ];
            
            setTree(mockTree);
            setUsingMock(true);
            setError("Could not fetch live data (Backend API 'roles/tree' missing). Showing demonstration data based on spec.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTree();
    }, []);

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Organizational Structure</h2>
                    <p className="text-muted-foreground mt-1 text-sm">Visualize and manage role hierarchy and reporting lines.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchTree} disabled={loading}>
                        <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
                        Refresh
                    </Button>
                    <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Root Role
                    </Button>
                </div>
            </div>

            {error && (
                <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertTitle>Demonstration Mode</AlertTitle>
                    <AlertDescription>
                        {error}
                    </AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                             <Network className="w-5 h-5" />
                        </div>
                        <div>
                             <CardTitle>Role Hierarchy</CardTitle>
                             <CardDescription>
                                 {tree.length} Root Roles • {usingMock ? 'Simulated Data' : 'Live Data'}
                             </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading && !tree.length ? (
                        <div className="flex items-center justify-center p-12 text-gray-400">
                            Loading structure...
                        </div>
                    ) : (
                        <div className="max-w-4xl">
                            <RoleTree nodes={tree} />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
