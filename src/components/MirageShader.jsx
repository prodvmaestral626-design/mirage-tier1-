import React, { useEffect, useRef } from 'react';

export default function MirageShader() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    window.addEventListener('resize', resize);
    resize();

    const vsSource = `attribute vec2 a_position; void main() { gl_Position = vec4(a_position, 0.0, 1.0); }`;
    
    // Complex fluid noise shader
    const fsSource = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      
      vec2 hash2(vec2 p) {
        return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
      }
      
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f*f*(3.0-2.0*f);
        return mix(mix(dot(hash2(i+vec2(0,0)), f-vec2(0,0)), 
                       dot(hash2(i+vec2(1,0)), f-vec2(1,0)), u.x),
                   mix(dot(hash2(i+vec2(0,1)), f-vec2(0,1)), 
                       dot(hash2(i+vec2(1,1)), f-vec2(1,1)), u.x), u.y);
      }
      
      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 5; i++) {
          v += a * noise(p);
          p *= 2.0;
          a *= 0.5;
        }
        return v;
      }
      
      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 p = uv * 3.0;
        
        float t = u_time * 0.1;
        
        // Domain warping for fluid effect
        vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) + t));
        vec2 r = vec2(fbm(p + 4.0*q + vec2(1.7, 9.2) - t), fbm(p + 4.0*q + vec2(8.3, 2.8) + t));
        float f = fbm(p + 4.0*r);
        
        // Base Metallic Charcoal
        vec3 base = vec3(0.05, 0.05, 0.06);
        
        // Mirage Colors: Crimson, Electric Blue, Gold
        vec3 col1 = vec3(0.8, 0.2, 0.2); // Red
        vec3 col2 = vec3(0.1, 0.3, 0.8); // Blue
        vec3 col3 = vec3(0.83, 0.68, 0.22); // Gold
        
        // Blend colors based on fluid noise
        vec3 color = base;
        color = mix(color, col1, smoothstep(0.4, 0.6, f) * 0.4);
        color = mix(color, col2, smoothstep(0.5, 0.8, length(r)) * 0.3);
        color = mix(color, col3, smoothstep(0.7, 0.9, q.x) * 0.2);
        
        // Vignette for depth
        float vig = 1.0 - length(uv - 0.5) * 0.8;
        color *= vig;
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const compileShader = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const program = gl.createProgram();
    gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vsSource));
    gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fsSource));
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    
    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const resLoc = gl.getUniformLocation(program, 'u_resolution');

    let raf;
    const render = (t) => {
      gl.uniform1f(timeLoc, t * 0.001);
      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(render);
    };
    render(0);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full z-[-1] opacity-40 pointer-events-none"
      style={{ filter: 'blur(60px) saturate(1.2)' }}
    />
  );
}
