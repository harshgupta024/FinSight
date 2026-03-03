/**
 * AnimatedBackground — Gold Particle Network Canvas
 * 90 particles with connection lines, mouse attraction, and cursor glow.
 */
import { useEffect, useRef } from 'react';
import { useTheme } from '../hooks/useTheme';

const PARTICLE_COUNT = 90;
const CONNECTION_DIST = 110;
const MOUSE_ATTRACT_DIST = 160;
const MOUSE_FORCE = 0.015;
const MAX_SPEED = 2.5;

const AnimatedBackground = () => {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: -999, y: -999 });
    const { isDark } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Track mouse
        const onMouseMove = (e) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener('mousemove', onMouseMove);

        // Create particles
        const particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                radius: Math.random() * 1.8 + 0.4,
                opacity: Math.random() * 0.5 + 0.2,
            });
        }

        const goldR = isDark ? 212 : 184;
        const goldG = isDark ? 175 : 150;
        const goldB = isDark ? 55 : 15;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const mouse = mouseRef.current;

            // Draw radial glow at cursor
            if (mouse.x > 0 && mouse.y > 0) {
                const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 180);
                gradient.addColorStop(0, `rgba(${goldR}, ${goldG}, ${goldB}, 0.07)`);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.fillRect(mouse.x - 180, mouse.y - 180, 360, 360);
            }

            // Update & draw particles
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // Mouse attraction
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MOUSE_ATTRACT_DIST && dist > 0) {
                    p.vx += (dx / dist) * MOUSE_FORCE;
                    p.vy += (dy / dist) * MOUSE_FORCE;
                }

                // Cap speed
                const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                if (speed > MAX_SPEED) {
                    p.vx = (p.vx / speed) * MAX_SPEED;
                    p.vy = (p.vy / speed) * MAX_SPEED;
                }

                p.x += p.vx;
                p.y += p.vy;

                // Wrap edges
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                // Draw particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${goldR}, ${goldG}, ${goldB}, ${p.opacity})`;
                ctx.fill();

                // Draw connections
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const cdx = p.x - p2.x;
                    const cdy = p.y - p2.y;
                    const cdist = Math.sqrt(cdx * cdx + cdy * cdy);

                    if (cdist < CONNECTION_DIST) {
                        const lineOpacity = 0.18 * (1 - cdist / CONNECTION_DIST);
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(${goldR}, ${goldG}, ${goldB}, ${lineOpacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMouseMove);
        };
    }, [isDark]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                inset: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 0,
                pointerEvents: 'none',
                opacity: isDark ? 0.7 : 0.4,
            }}
        />
    );
};

export default AnimatedBackground;
