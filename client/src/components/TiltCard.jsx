/**
 * TiltCard — 3D perspective tilt on mouse move with inner glow.
 * Usage: <TiltCard className="p-6" ...>content</TiltCard>
 */
import { useRef, useState } from 'react';

const TiltCard = ({ children, className = '', style = {}, ...props }) => {
    const cardRef = useRef(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [glowPos, setGlowPos] = useState({ x: 50, y: 0 });

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;

        // Clamp rotation to ±8 degrees
        const rotateY = Math.max(-8, Math.min(8, -(mouseX / 30)));
        const rotateX = Math.max(-8, Math.min(8, mouseY / 30));

        setTilt({ x: rotateX, y: rotateY });
        setGlowPos({
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
        });
    };

    const handleMouseLeave = () => {
        setTilt({ x: 0, y: 0 });
        setIsHovered(false);
    };

    return (
        <div
            ref={cardRef}
            className={`glass-card ${className}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            style={{
                ...style,
                transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transition: 'transform 0.15s ease, border-color 0.3s ease, box-shadow 0.3s ease',
                borderColor: isHovered ? 'var(--gold-border-hover)' : 'var(--glass-border)',
                backgroundImage: isHovered
                    ? `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, rgba(212, 175, 55, 0.06), transparent 60%)`
                    : 'none',
            }}
            {...props}
        >
            {children}
        </div>
    );
};

export default TiltCard;
