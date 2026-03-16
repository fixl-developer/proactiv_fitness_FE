'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageDebugProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
}

export default function ImageDebug({ src, alt, width = 400, height = 300, className = '' }: ImageDebugProps) {
    const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState<string>('');

    return (
        <div className={`relative ${className}`}>
            {imageStatus === 'loading' && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                    <span className="text-gray-500">Loading...</span>
                </div>
            )}

            {imageStatus === 'error' && (
                <div className="absolute inset-0 bg-red-100 flex items-center justify-center p-4">
                    <div className="text-center">
                        <div className="text-red-600 text-2xl mb-2">❌</div>
                        <div className="text-red-800 text-sm font-semibold">Failed to load image</div>
                        <div className="text-red-600 text-xs mt-1 font-mono break-all">{src}</div>
                        {errorMessage && (
                            <div className="text-red-500 text-xs mt-1">{errorMessage}</div>
                        )}
                    </div>
                </div>
            )}

            <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                className={`${imageStatus === 'loaded' ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
                onLoad={() => {
                    console.log(`✅ Image loaded successfully: ${src}`);
                    setImageStatus('loaded');
                }}
                onError={(e) => {
                    console.error(`❌ Image failed to load: ${src}`, e);
                    setImageStatus('error');
                    setErrorMessage(e.toString());
                }}
                priority={false}
            />
        </div>
    );
}