import { useRef, useEffect } from 'react';

export default function ShaderWallpaper({ accentColor = '#FF6B00', bgColor = '#ffffff' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const hexToVec3 = (hex) => {
      const r = parseInt(hex.slice(1,3), 16) / 255;
      const g = parseInt(hex.slice(3,5), 16) / 255;
      const b = parseInt(hex.slice(5,7), 16) / 255;
      return `${r.toFixed(3)}, ${g.toFixed(3)}, ${b.toFixed(3)}`;
    };

    const vertexShaderSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision highp float;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec3 uAccent;
      uniform vec3 uBg;

      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution;
        float aspect = uResolution.x / uResolution.y;
        vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

        float r = length(p);
        float a = atan(p.y, p.x);
        float t = uTime * 0.05;

        float f1 = sin(r * 12.0 - t * 1.5) * cos(a * 4.0 + t);
        float f2 = sin(r * 18.0 + t * 2.0) * sin(a * 6.0 - t * 1.2);
        float f3 = sin((r * 10.0 + a * 2.0) + t * 0.8);

        float f = (f1 + f2 + f3) / 3.0;
        float dist = 1.0 - abs(f) * 0.8;

        float mask = smoothstep(0.0, 0.8, dist);
        float border = smoothstep(0.8, 1.0, dist) * 0.3;

        vec3 color = mix(uBg, uAccent, mask * 0.6);
        color = mix(color, vec3(1.0), border * 0.4);

        gl_FragColor = vec4(color, 0.25);
      }
    `;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  1, -1, -1,  1,
      -1,  1,  1, -1,  1,  1
    ]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const timeLocation = gl.getUniformLocation(program, 'uTime');
    const resolutionLocation = gl.getUniformLocation(program, 'uResolution');
    const accentLocation = gl.getUniformLocation(program, 'uAccent');
    const bgLocation = gl.getUniformLocation(program, 'uBg');

    let animationFrameId;
    const startTime = performance.now();

    const render = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      gl.uniform1f(timeLocation, elapsed);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform3f(accentLocation, ...hexToVec3(accentColor).split(', ').map(Number));
      gl.uniform3f(bgLocation, ...hexToVec3(bgColor).split(', ').map(Number));

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      gl.deleteProgram(program);
    };
  }, [accentColor, bgColor]);

  return <canvas id="shader-bg" ref={canvasRef} />;
}
