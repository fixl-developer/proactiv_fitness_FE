'use client';

import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
                    <div className="w-full max-w-md text-center">
                        <div className="mb-4 flex justify-center">
                            <AlertTriangle className="h-16 w-16 text-red-500" />
                        </div>
                        <h1 className="mb-2 text-2xl font-bold text-gray-900">
                            Oops! Something went wrong
                        </h1>
                        <p className="mb-6 text-gray-600">
                            We're sorry for the inconvenience. Please try refreshing the page.
                        </p>
                        {this.state.error && (
                            <details className="mb-6 rounded-lg bg-red-50 p-4 text-left text-sm">
                                <summary className="cursor-pointer font-medium text-red-900">
                                    Error details
                                </summary>
                                <pre className="mt-2 overflow-auto text-xs text-red-800">
                                    {this.state.error.message}
                                </pre>
                            </details>
                        )}
                        <div className="flex justify-center space-x-4">
                            <Button
                                onClick={() => window.location.reload()}
                                variant="default"
                            >
                                Refresh Page
                            </Button>
                            <Button
                                onClick={() => (window.location.href = '/')}
                                variant="outline"
                            >
                                Go Home
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
