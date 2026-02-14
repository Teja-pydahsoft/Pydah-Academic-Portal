import React from 'react';
import { clsx } from 'clsx';
import './Skeleton.css';

/**
 * Advanced Skeleton Loading Component
 * 
 * Usage:
 * <Skeleton className="w-full h-4" />
 * <Skeleton variant="circular" width={40} height={40} />
 * <Skeleton count={3} />
 */
const Skeleton = ({
    className,
    variant = 'rectangular',
    width,
    height,
    style = {},
    count = 1
}) => {
    const baseClasses = clsx(
        'skeleton',
        {
            'skeleton-text': variant === 'text',
            'skeleton-circular': variant === 'circular',
            'skeleton-rectangular': variant === 'rectangular',
        },
        className
    );

    const styles = {
        width: width,
        height: height,
        ...style,
    };

    if (count > 1) {
        return (
            <>
                {Array.from({ length: count }).map((_, index) => (
                    <div
                        key={index}
                        className={baseClasses}
                        style={styles}
                        aria-hidden="true"
                    />
                ))}
            </>
        );
    }

    return (
        <div
            className={baseClasses}
            style={styles}
            aria-hidden="true"
        />
    );
};

export default Skeleton;
