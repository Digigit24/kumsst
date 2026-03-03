/**
 * Debug Page - Displays API responses for debugging
 */

import { useState, useEffect } from 'react';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api.config';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';
import { RefreshCw, Copy, Check } from 'lucide-react';

export const DebugPage = () => {
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('kumss_auth_token');
            const response = await fetch(buildApiUrl(API_ENDPOINTS.users.me), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-Tenant-ID': 'all',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setUserData(data);
        } catch (err: any) {
            setError(typeof err.message === 'string' ? err.message : 'Failed to fetch user data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const copyToClipboard = () => {
        if (userData) {
            navigator.clipboard.writeText(JSON.stringify(userData, null, 2));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="min-h-screen p-6 space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Debug Console</h1>
                    <p className="text-muted-foreground mt-1">API Response Inspector</p>
                </div>
                <Button onClick={fetchUserData} disabled={loading} size="sm">
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Endpoint Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Badge variant="outline">GET</Badge>
                        /api/v1/accounts/me/
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">Full URL:</span>
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                                {buildApiUrl(API_ENDPOINTS.users.me)}
                            </code>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">Status:</span>
                            {loading && <Badge>Loading...</Badge>}
                            {error && <Badge variant="destructive">Error</Badge>}
                            {!loading && !error && <Badge variant="success">Success</Badge>}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Response */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Response</CardTitle>
                        {userData && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={copyToClipboard}
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-4 w-4 mr-2" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy JSON
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {loading && (
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-4 w-4/5" />
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                            <p className="text-sm font-semibold text-destructive">Error:</p>
                            <p className="text-sm text-destructive/90 mt-1">{error}</p>
                        </div>
                    )}

                    {!loading && !error && userData && (
                        <div className="relative">
                            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                                <code>{JSON.stringify(userData, null, 2)}</code>
                            </pre>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Parsed Data (if successful) */}
            {!loading && !error && userData && (
                <Card>
                    <CardHeader>
                        <CardTitle>Parsed User Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(userData).map(([key, value]) => (
                                <div key={key} className="space-y-1">
                                    <label className="text-sm font-medium text-muted-foreground capitalize">
                                        {key.replace(/_/g, ' ')}
                                    </label>
                                    <p className="font-medium text-sm">
                                        {value !== null && value !== undefined
                                            ? typeof value === 'object'
                                                ? JSON.stringify(value)
                                                : String(value)
                                            : 'N/A'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Request Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Request Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">Headers:</p>
                            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                                {`Authorization: Token ${localStorage.getItem('kumss_auth_token')?.slice(0, 20)}...
Content-Type: application/json
X-Tenant-ID: all`}
                            </pre>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">Method:</p>
                            <Badge>GET</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
