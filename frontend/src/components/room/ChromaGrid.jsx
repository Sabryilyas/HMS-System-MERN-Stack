import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import './ChromaGrid.css';

export const ChromaGrid = ({
    items = [],
    className = '',
    radius = 300,
    damping = 0.45,
    fadeOut = 0.6,
    ease = 'power3.out'
}) => {
    const rootRef = useRef(null);
    const fadeRef = useRef(null);
    const setX = useRef(null);
    const setY = useRef(null);
    const pos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const el = rootRef.current;
        if (!el) return;

        try {
            setX.current = gsap.quickSetter(el, '--x', 'px');
            setY.current = gsap.quickSetter(el, '--y', 'px');
            const { width, height } = el.getBoundingClientRect();
            pos.current = { x: width / 2, y: height / 2 };
            setX.current(pos.current.x);
            setY.current(pos.current.y);
        } catch (error) {
            console.error('ChromaGrid initialization error:', error);
        }
    }, []);

    const moveTo = (x, y) => {
        if (!setX.current || !setY.current) return;

        gsap.to(pos.current, {
            x,
            y,
            duration: damping,
            ease,
            onUpdate: () => {
                if (setX.current && setY.current) {
                    setX.current(pos.current.x);
                    setY.current(pos.current.y);
                }
            },
            overwrite: true
        });
    };

    const handleMove = (e) => {
        if (!rootRef.current || !fadeRef.current) return;

        try {
            const r = rootRef.current.getBoundingClientRect();
            moveTo(e.clientX - r.left, e.clientY - r.top);
            gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
        } catch (error) {
            console.error('ChromaGrid handleMove error:', error);
        }
    };

    const handleLeave = () => {
        if (!fadeRef.current) return;

        try {
            gsap.to(fadeRef.current, {
                opacity: 1,
                duration: fadeOut,
                overwrite: true
            });
        } catch (error) {
            console.error('ChromaGrid handleLeave error:', error);
        }
    };

    const handleCardClick = (url) => {
        if (url) {
            window.location.href = url;
        }
    };

    const handleCardMove = (e) => {
        try {
            const card = e.currentTarget;
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        } catch (error) {
            console.error('ChromaGrid handleCardMove error:', error);
        }
    };

    if (!items || items.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-600">No rooms available</p>
            </div>
        );
    }

    return (
        <div
            ref={rootRef}
            className={`chroma-grid ${className}`}
            style={{
                '--r': `${radius}px`
            }}
            onPointerMove={handleMove}
            onPointerLeave={handleLeave}
        >
            {items.map((item, i) => (
                <article
                    key={item.url || i}
                    className="chroma-card"
                    onMouseMove={handleCardMove}
                    onClick={() => handleCardClick(item.url)}
                    style={{
                        '--card-border': item.borderColor || '#3B82F6',
                        '--card-gradient': item.gradient || 'linear-gradient(145deg, #3B82F6, #000)',
                        cursor: item.url ? 'pointer' : 'default'
                    }}
                >
                    <div className="chroma-img-wrapper">
                        <img
                            src={item.image}
                            alt={item.title}
                            loading="lazy"
                            onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800';
                            }}
                        />
                    </div>
                    <footer className="chroma-info">
                        <h3 className="name">{item.title}</h3>
                        {item.handle && <span className="handle">{item.handle}</span>}
                        <p className="role">{item.subtitle}</p>
                        {item.location && <span className="location">{item.location}</span>}
                    </footer>
                </article>
            ))}
            <div className="chroma-overlay" />
            <div ref={fadeRef} className="chroma-fade" />
        </div>
    );
};

export default ChromaGrid;
