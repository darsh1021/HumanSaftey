import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';

const PhysicsBackground = () => {
  const sceneRef = useRef(null);
  const engineRef = useRef(null);
  const renderRef = useRef(null);

  useEffect(() => {
    if (!sceneRef.current) return;

    // module aliases
    const Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Bodies = Matter.Bodies,
      Composite = Matter.Composite,
      Mouse = Matter.Mouse,
      MouseConstraint = Matter.MouseConstraint;

    // create an engine
    const engine = Engine.create({
      gravity: { x: 0, y: 0.1, scale: 0.001 },
    });
    engineRef.current = engine;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // create a renderer
    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width,
        height,
        background: 'transparent',
        wireframes: false,
        pixelRatio: window.devicePixelRatio,
      },
    });
    renderRef.current = render;

    // create boundaries
    const walls = [
      Bodies.rectangle(width / 2, height + 50, width, 100, { isStatic: true, render: { visible: false } }),
      Bodies.rectangle(-50, height / 2, 100, height, { isStatic: true, render: { visible: false } }),
      Bodies.rectangle(width + 50, height / 2, 100, height, { isStatic: true, render: { visible: false } }),
      Bodies.rectangle(width / 2, -150, width, 100, { isStatic: true, render: { visible: false } }),
    ];

    // Array to hold our floating elements
    const elements = [];

    // Helper to create an emoji body
    const createEmojiBody = (x, y, text, size, color) => {
      const radius = size / 2;
      return Bodies.circle(x, y, radius, {
        restitution: 0.8,
        friction: 0.005,
        density: 0.04,
        render: {
          fillStyle: 'transparent', // We'll clear the default fill so we can render text later (matter-js native render doesn't support text easily without canvas manipulation, or we'll just use sprites/HTML overlays).
          // Actually, matter.js render is canvas-based. Since we want an interactive physics background *behind* our content,
          // Let's create colored circles that look like glowing orbs or warning signs for now, or use SVGs.
          sprite: {
             // For a quick premium feel, we'll draw shapes.
          }
        },
      });
    };

    // We can just use distinct colored shapes that represent objects, since matter.js canvas natively doesn't draw emojis very easily without plugins or html sync.
    // Let's sync matter.js bodies to React DOM elements for the emojis/icons.
    // Wait, the easiest way to have interactive floating DOM elements with matter.js:
    
    // Create random bodies
    const colors = ['#00D1FF', '#FF3B3B', '#00FF9C', '#aa3bff', 'rgba(255,255,255,0.2)'];
    
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * width;
        const y = Math.random() * -height; // start above screen
        const radius = Math.random() * 20 + 10;
        
        const type = Math.random();
        let body;
        
        if (type < 0.3) {
            // Neon circle
             body = Bodies.circle(x, y, radius, {
                restitution: 0.9,
                render: { fillStyle: colors[Math.floor(Math.random() * colors.length)] }
            });
        } else if (type < 0.6) {
           // Warning triangle
             body = Bodies.polygon(x, y, 3, radius * 1.5, {
                restitution: 0.7,
                render: { fillStyle: '#FF3B3B' }
            });
        } else {
             // Box
             body = Bodies.rectangle(x, y, radius*2, radius*2, {
                 restitution: 0.8,
                 render: { fillStyle: 'transparent', strokeStyle: '#00D1FF', lineWidth: 2 }
             });
        }
        
        elements.push(body);
    }

    // add all of the bodies to the world
    Composite.add(engine.world, [...walls, ...elements]);

    // add mouse control
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false,
        },
      },
    });

    Composite.add(engine.world, mouseConstraint);

    // keep the mouse in sync with rendering
    render.mouse = mouse;

    // run the renderer
    Render.run(render);

    // create runner
    const runner = Runner.create();

    // run the engine
    Runner.run(runner, engine);
    
    // Add some random upward force occasionally for a "floating in zero-g" feel
    const applyForceInterval = setInterval(() => {
        elements.forEach(body => {
            if (body.position.y > height - 100) {
                 Matter.Body.applyForce(body, body.position, {
                    x: (Math.random() - 0.5) * 0.05,
                    y: -0.05 - Math.random() * 0.05
                 });
            }
        });
    }, 2000);

    const handleResize = () => {
      render.canvas.width = window.innerWidth;
      render.canvas.height = window.innerHeight;
      Matter.Render.setPixelRatio(render, window.devicePixelRatio);
      
      // Update walls
      Matter.Body.setPosition(walls[0], { x: window.innerWidth / 2, y: window.innerHeight + 50 });
      Matter.Body.setPosition(walls[1], { x: -50, y: window.innerHeight / 2 });
      Matter.Body.setPosition(walls[2], { x: window.innerWidth + 50, y: window.innerHeight / 2 });
      Matter.Body.setPosition(walls[3], { x: window.innerWidth / 2, y: -150 });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(applyForceInterval);
      Render.stop(render);
      Runner.stop(runner);
      if (engineRef.current) {
         Composite.clear(engineRef.current.world);
         Engine.clear(engineRef.current);
      }
      if (render.canvas) {
          render.canvas.remove();
      }
    };
  }, []);

  return (
    <div 
        ref={sceneRef} 
        className="absolute inset-0 z-0 pointer-events-auto opacity-30 mix-blend-screen"
        style={{ pointerEvents: 'auto' }} // Allow mouse interaction
    />
  );
};

export default PhysicsBackground;
