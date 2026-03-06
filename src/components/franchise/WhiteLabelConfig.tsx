'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palette, Upload } from 'lucide-react';
import type { Franchise } from '@/types/enterprise';

interface WhiteLabelConfigProps {
    franchise: Franchise;
    onUpdate: (data: Partial<Franchise>) => void;
}

export default function WhiteLabelConfig({ franchise, onUpdate }: WhiteLabelConfigProps) {
    const [formData, setFormData] = useState({
        primaryColor: franchise.primaryColor,
        secondaryColor: franchise.secondaryColor,
        logo: franchise.logo,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate(formData);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    White-Label Configuration
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="logo">Logo</Label>
                        <div className="flex items-center gap-4">
                            {formData.logo && (
                                <img
                                    src={formData.logo}
                                    alt="Logo"
                                    className="h-16 w-16 object-contain border rounded"
                                />
                            )}
                            <Button type="button" variant="outline">
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Logo
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="primaryColor">Primary Color</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="primaryColor"
                                    type="color"
                                    value={formData.primaryColor}
                                    onChange={(e) =>
                                        setFormData({ ...formData, primaryColor: e.target.value })
                                    }
                                    className="w-20 h-10"
                                />
                                <Input
                                    value={formData.primaryColor}
                                    onChange={(e) =>
                                        setFormData({ ...formData, primaryColor: e.target.value })
                                    }
                                    placeholder="#3b82f6"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="secondaryColor">Secondary Color</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="secondaryColor"
                                    type="color"
                                    value={formData.secondaryColor}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            secondaryColor: e.target.value,
                                        })
                                    }
                                    className="w-20 h-10"
                                />
                                <Input
                                    value={formData.secondaryColor}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            secondaryColor: e.target.value,
                                        })
                                    }
                                    placeholder="#8b5cf6"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                        <p className="text-sm font-medium mb-2">Preview</p>
                        <div className="flex gap-2">
                            <div
                                className="w-20 h-20 rounded"
                                style={{ backgroundColor: formData.primaryColor }}
                            />
                            <div
                                className="w-20 h-20 rounded"
                                style={{ backgroundColor: formData.secondaryColor }}
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full">
                        Save Configuration
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
