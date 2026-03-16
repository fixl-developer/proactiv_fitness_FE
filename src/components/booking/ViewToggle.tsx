'use client';

import { Grid3x3, Calendar, List } from 'lucide-react';
import type { ViewMode } from '@/types/booking';

interface ViewToggleProps {
    currentView: ViewMode;
    onViewChange: (view: ViewMode) => void;
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
    const views: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
        { mode: 'grid', icon: <Grid3x3 className="w-5 h-5" />, label: 'Grid' },
        { mode: 'week', icon: <Calendar className="w-5 h-5" />, label: 'Week' },
        { mode: 'schedule', icon: <List className="w-5 h-5" />, label: 'Schedule' },
    ];

    return (
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
            {views.map((view) => (
                <button
                    key={view.mode}
                    onClick={() => onViewChange(view.mode)}
                    className={`
            flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all
            ${currentView === view.mode
                            ? 'bg-white text-primary shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }
          `}
                >
                    {view.icon}
                    <span className="hidden sm:inline">{view.label}</span>
                </button>
            ))}
        </div>
    );
}
