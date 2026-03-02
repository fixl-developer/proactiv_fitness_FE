import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
    return (
        <main className="min-h-screen">
            {/* Temporary homepage - will be replaced with actual hero section */}
            <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-24">
                <div className="text-center">
                    <h1 className="mb-4 text-6xl font-bold tracking-tight text-gray-900">
                        Proactiv Fitness
                    </h1>
                    <p className="mb-8 text-xl text-gray-600">
                        Modern Sports & Gymnastics Management System
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link href="/login">
                            <Button size="lg">Sign In</Button>
                        </Link>
                        <Link href="/register">
                            <Button size="lg" variant="outline">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
