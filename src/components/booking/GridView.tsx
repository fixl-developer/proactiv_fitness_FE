'use client';

import { ClassCard } from './ClassCard';
import type { Class } from '@/types/booking';

interface GridViewProps {
    classes: Class[];
    isLoading?: boolean;
}

export function GridView({ classes, isLoading }: GridViewProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-gray-200 rounded-xl h-96 animate-pulse"
                    />
                ))}
            </div>
        );
    }

    if (classes.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No classes found matching your filters.</p>
                <p className="text-gray-400 mt-2">Try adjusting your search criteria.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem) => (
                <ClassCard key={classItem.id} classItem={classItem} />
            ))}
        </div>
    );
}
