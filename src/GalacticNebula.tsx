import React, { useEffect, useRef } from 'react';

const VS = 'attribute vec2 aPos;void main(){gl_Position=vec4(aPos,0.,1.);}';
const FS = `precision highp float;
uniform float uTime;uniform vec2 uRes;uniform vec3 uA;uniform vec3 uB;uniform vec3 uC;uniform vec3 uD;uniform float uSeed;uniform float uInt;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.03;a*=.5;}return v;}
void main(){
 vec2 uv=gl_FragCoord.xy/uRes.xy;
 vec2 p=uv*vec2(uRes.x/uRes.y,1.)*2.6+uSeed*7.3;
 float t=uTime*.08;
 vec2 q=vec2(fbm(p+t),fbm(p+vec2(5.2,1.3)-t));
 vec2 r=vec2(fbm(p+4.*q+vec2(1.7,9.2)+t*.7),fbm(p+4.*q+vec2(8.3,2.8)-t*.5));
 float f=fbm(p+4.*r);
 vec3 col=mix(uA,uB,clamp(f*f*3.4,0.,1.));
 col=mix(col,uC,smoothstep(.42,1.05,length(r))*.9);
 col=mix(col,uD,smoothstep(.55,.95,q.x)*smoothstep(.4,.8,f)*.55);
 col*=(0.2+1.45*f*f)*uInt;
 float vig=smoothstep(1.3,.2,length(uv-.5)*1.4);
 gl_FragColor=vec4(col*vig,1.);}`;

const hexToVec = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

/**
 * GalacticNebula Background
 * Extracted directly from blueprintaiconsultingco.com
 * Combines domain-warped fluid WebGL shader with twinkling starfield particles.
 */
export default function GalacticNebula() {
  const webglCanvasRef = useRef<HTMLCanvasElement>(null);
  const starsCanvasRef = useRef<HTMLCanvasElement>(null);

  // WebGL Domain-Warped Nebula Fluid Shader
  useEffect(() => {
    const canvas = webglCanvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) return;

    const mk = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, mk(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, mk(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const U = (n: string) => gl.getUniformLocation(prog, n);
    const uTime = U('uTime');
    const uRes = U('uRes');
    // Exact colors from blueprintaiconsultingco.com IMMERSIVE palette
    gl.uniform3fv(U('uA'), hexToVec('#030b1e')); // Deep cosmos navy
    gl.uniform3fv(U('uB'), hexToVec('#007fff')); // Blueprint electric blue
    gl.uniform3fv(U('uC'), hexToVec('#0a4fd0')); // Deep royal nebula
    gl.uniform3fv(U('uD'), hexToVec('#57c8ff')); // Bright cyan highlight
    gl.uniform1f(U('uSeed'), 3.7);
    gl.uniform1f(U('uInt'), 0.85);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
        gl.uniform2f(uRes, w, h);
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let raf = 0;
    const t0 = performance.now();
    const loop = () => {
      gl.uniform1f(uTime, (performance.now() - t0) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    };
  }, []);

  // Twinkling Galactic Starfield Particle Canvas
  useEffect(() => {
    const canvas = starsCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const starCount = Math.floor(Math.min(window.innerWidth, 1600) * 0.15);
    const stars: Array<{
      x: number;
      y: number;
      radius: number;
      alpha: number;
      baseAlpha: number;
      speed: number;
      twinkleSpeed: number;
      color: string;
    }> = [];

    const starPalette = ['#ffffff', '#57c8ff', '#8fd9ff', '#8b5cff', '#007fff'];

    for (let i = 0; i < starCount; i++) {
      const baseAlpha = 0.2 + Math.random() * 0.65;
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() < 0.85 ? Math.random() * 1.2 + 0.4 : Math.random() * 2 + 1.2,
        alpha: baseAlpha,
        baseAlpha,
        speed: (Math.random() - 0.5) * 0.08,
        twinkleSpeed: 0.01 + Math.random() * 0.03,
        color: starPalette[Math.floor(Math.random() * starPalette.length)],
      });
    }

    let starRaf = 0;
    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      angle += 0.02;

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.y += s.speed;
        if (s.y < 0) s.y = height;
        if (s.y > height) s.y = 0;

        const currentAlpha = Math.max(0.1, s.baseAlpha + Math.sin(angle * s.twinkleSpeed * 50 + i) * 0.3);

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = currentAlpha;
        ctx.fill();

        // Extra subtle glow for brighter stars
        if (s.radius > 1.4) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.globalAlpha = currentAlpha * 0.25;
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      starRaf = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(starRaf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-[#05060c]" aria-hidden>
      {/* Procedural WebGL Galactic Fluid Nebula */}
      <canvas
        ref={webglCanvasRef}
        className="absolute inset-0 w-full h-full object-cover opacity-85"
      />

      {/* Twinkling Starfield Particles */}
      <canvas
        ref={starsCanvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Blueprint Drafting Grid Overlay */}
      <div className="absolute inset-0 blueprint-grid opacity-30" />

      {/* Scanlines & Vignette */}
      <div className="absolute inset-0 immersive-scanlines" />
      <div className="absolute inset-0 immersive-vignette" />
    </div>
  );
}
