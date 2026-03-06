'use client';

import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import FranchiseList from '@/components/franchise/FranchiseList';
import FranchiseForm from '@/components/franchise/FranchiseForm';
import { getFranchises, createFranchise, updateFranchise } from '@/lib/api/enterprise';
import type { Franchise } from '@/types/enterprise';
import { useToast } from '@/hooks/use-toast';

export default function FranchiseManagementPage() {
    const { toast } = useToast();
    const [franchises, setFranchises] = useState<Franchise[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingFranchise, setEditingFranchise] = useState<Franchise | undefined>();

    useEffect(() => {
        fetchFranchises();
    }, []);

    const fetchFranchises = async () => {
        try {
            const data = await getFranchises();
            setFranchises(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load franchises',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (data: any) => {
        try {
            if (editingFranchise) {
                await updateFranchise(editingFranchise.id, data);
                toast({
                    title: 'Success',
                    description: 'Franchise updated successfully',
                });
            } else {
                await createFranchise(data);
                toast({
                    title: 'Success',
                    description: 'Franchise created successfully',
                });
            }
            fetchFranchises();
            setShowForm(false);
            setEditingFranchise(undefined);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Operation failed',
                variant: 'destructive',
            });
        }
    };

    const handleEdit = (franchise: Franchise) => {
        setEditingFranchise(franchise);
        setShowForm(true);
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Franchise Management</h1>
                    <p className="text-muted-foreground">
                        Manage franchise locations and performance
                    </p>
                </div>
                {!showForm && (
                    <Button onClick={() => setShowForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Franchise
                    </Button>
                )}
            </div>

            {showForm ? (
                <FranchiseForm
                    franchise={editingFranchise}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingFranchise(undefined);
                    }}
                />
            ) : (
                <FranchiseList franchises={franchises} onEdit={handleEdit} />
            )}
        </div>
    );
}
