/**
 * AnimatedBackground
 * Financial-themed animated particles and floating elements.
 * Adapts to light/dark mode with different color schemes.
 */
import { useEffect, useRef } from 'react';
import { useTheme } from '../hooks/useTheme';

const AnimatedBackground = () => {
    const canvasRef = useRef(null);
    const { isDark } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationId;
        let particles = [];
        let floatingSymbols = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Financial symbols
        const symbols = ['$', '₿', '€', '£', '¥', '◆', '▲', '▼', '⬡'];

        // Create particles
        const createParticles = () => {
            particles = [];
            const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: (Math.random() - 0.5) * 0.4,
                    radius: Math.random() * 2 + 0.5,
                    opacity: Math.random() * 0.5 + 0.1,
                });
            }
        };

        // Create floating financial symbols
        const createSymbols = () => {
            floatingSymbols = [];
            const count = Math.min(12, Math.floor(canvas.width / 150));
            for (let i = 0; i < count; i++) {
                floatingSymbols.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vy: -(Math.random() * 0.3 + 0.1),
                    vx: (Math.random() - 0.5) * 0.2,
                    symbol: symbols[Math.floor(Math.random() * symbols.length)],
                    size: Math.random() * 16 + 10,
                    opacity: Math.random() * 0.15 + 0.03,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.01,
                });
            }
        };

        createParticles();
        createSymbols();

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Color scheme based on theme
            const particleColor = isDark ? '129, 140, 248' : '99, 102, 241'; // primary-400 / primary-500
            const lineColor = isDark ? '129, 140, 248' : '99, 102, 241';
            const symbolColor = isDark ? '129, 140, 248' : '79, 70, 229';

            // Draw and update particles
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;

                // Wrap around edges
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                // Draw particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${particleColor}, ${p.opacity})`;
                ctx.fill();

                // Draw connections
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(${lineColor}, ${0.08 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            // Draw floating symbols
            for (const s of floatingSymbols) {
                s.y += s.vy;
                s.x += s.vx;
                s.rotation += s.rotationSpeed;

                // Reset when off-screen
                if (s.y < -30) {
                    s.y = canvas.height + 30;
                    s.x = Math.random() * canvas.width;
                }
                if (s.x < -30) s.x = canvas.width + 30;
                if (s.x > canvas.width + 30) s.x = -30;

                ctx.save();
                ctx.translate(s.x, s.y);
                ctx.rotate(s.rotation);
                ctx.font = `${s.size}px "Inter", sans-serif`;
                ctx.fillStyle = `rgba(${symbolColor}, ${s.opacity})`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(s.symbol, 0, 0);
                ctx.restore();
            }

            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    }, [isDark]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ opacity: isDark ? 0.6 : 0.4 }}
        />
    );
};

export default AnimatedBackground;
