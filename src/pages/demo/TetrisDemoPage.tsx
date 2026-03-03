
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import TetrisLoader, { TetrisLoaderProps } from '@/components/ui/tetris-loader';
import React, { useState } from 'react';

const TetrisDemoPage: React.FC = () => {
    const [size, setSize] = useState<TetrisLoaderProps['size']>('md');
    const [speed, setSpeed] = useState<TetrisLoaderProps['speed']>('normal');

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div>
                <h1 className="text-4xl font-bold">Tetris Loader Demo</h1>
                <p className="text-muted-foreground mt-2">
                    A purely visual, CSS/React-based loader inspired by Tetris. Built for shadcn/ui.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Interactive Playground */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Playground</CardTitle>
                        <CardDescription>Adjust props to see how the loader behaves.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex justify-center p-10 bg-muted/5 rounded-lg border border-dashed">
                            <TetrisLoader size={size} speed={speed} />
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Size</Label>
                                <Select value={size} onValueChange={(v) => setSize(v as any)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select size" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sm">Small</SelectItem>
                                        <SelectItem value="md">Medium</SelectItem>
                                        <SelectItem value="lg">Large</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Speed</Label>
                                <Select value={speed} onValueChange={(v) => setSpeed(v as any)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select speed" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="slow">Slow</SelectItem>
                                        <SelectItem value="normal">Normal</SelectItem>
                                        <SelectItem value="fast">Fast</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Variations Gallery */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Gallery</CardTitle>
                        <CardDescription>Common configurations and use cases.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">

                        <div className="flex flex-col items-center gap-2 p-4 border rounded-md">
                            <span className="text-xs font-semibold text-muted-foreground">Default (MD, Normal)</span>
                            <TetrisLoader />
                        </div>

                        <div className="flex flex-col items-center gap-2 p-4 border rounded-md">
                            <span className="text-xs font-semibold text-muted-foreground">Small & Fast</span>
                            <TetrisLoader size="sm" speed="fast" />
                        </div>

                        <div className="flex flex-col items-center gap-2 p-4 border rounded-md">
                            <span className="text-xs font-semibold text-muted-foreground">Large & Slow</span>
                            <TetrisLoader size="lg" speed="slow" />
                        </div>

                        <div className="flex flex-col items-center gap-2 p-4 border rounded-md">
                            <span className="text-xs font-semibold text-muted-foreground">Custom Colors</span>
                            <TetrisLoader
                                activeColor="bg-orange-500"
                                settledColor="bg-orange-200"
                                gridColor="bg-stone-100"
                            />
                        </div>

                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default TetrisDemoPage;
