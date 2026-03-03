/**
 * CustomCursor — Golden ring cursor with trailing dots.
 * Scales up 1.3x over interactive elements.
 */
import { useEffect, useRef, useState } from 'react';

const TRAIL_LENGTH = 10;

const CustomCursor = () => {
    const cursorRef = useRef(null);
    const [isHovering, setIsHovering] = useState(false);
    const trailRef = useRef([]);
    const trailElsRef = useRef([]);
    const posRef = useRef({ x: -100, y: -100 });

    useEffect(() => {
        // Check for touch device — hide custom cursor
        if ('ontouchstart' in window) return;

        const onMouseMove = (e) => {
            posRef.current = { x: e.clientX, y: e.clientY };

            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate(${e.clientX - 10}px, ${e.clientY - 10}px) scale(${isHovering ? 1.3 : 1})`;
            }

            // Update trail
            trailRef.current.unshift({ x: e.clientX, y: e.clientY });
            if (trailRef.current.length > TRAIL_LENGTH) trailRef.current.pop();

            trailElsRef.current.forEach((el, i) => {
                if (el && trailRef.current[i]) {
                    const t = trailRef.current[i];
                    el.style.transform = `translate(${t.x - 3}px, ${t.y - 3}px)`;
                    el.style.opacity = ((TRAIL_LENGTH - i) / TRAIL_LENGTH) * 0.35;
                }
            });
        };

        const onMouseOver = (e) => {
            const target = e.target;
            const isInteractive = target.closest('button, a, [role="button"], input, select, textarea, .nav-link, .glass-card, .btn-primary, .btn-secondary, .btn-danger');
            setIsHovering(!!isInteractive);
        };

        document.body.style.cursor = 'none';
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseover', onMouseOver);

        return () => {
            document.body.style.cursor = '';
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseover', onMouseOver);
        };
    }, [isHovering]);

    // Don't render on touch devices
    if (typeof window !== 'undefined' && 'ontouchstart' in window) return null;

    return (
        <>
            {/* Trailing dots */}
            {Array.from({ length: TRAIL_LENGTH }).map((_, i) => (
                <div
                    key={i}
                    ref={(el) => (trailElsRef.current[i] = el)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: 'rgba(212, 175, 55, 0.5)',
                        pointerEvents: 'none',
                        zIndex: 9998,
                        opacity: 0,
                        transition: 'opacity 0.15s ease',
                    }}
                />
            ))}

            {/* Main cursor ring */}
            <div
                ref={cursorRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    border: '1.5px solid #d4af37',
                    boxShadow: '0 0 10px rgba(212, 175, 55, 0.3)',
                    pointerEvents: 'none',
                    zIndex: 9999,
                    transition: 'transform 0.08s linear, box-shadow 0.2s ease',
                    mixBlendMode: 'screen',
                }}
            />
        </>
    );
};

export default CustomCursor;
