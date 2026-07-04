import { useEffect, useRef } from 'react'

const VERT = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

const FRAG = `
  precision mediump float;
  uniform float u_time;
  uniform vec2 u_resolution;

  float noise(vec2 st) {
    return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
  }

  float smoothNoise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = noise(i);
    float b = noise(i + vec2(1.0, 0.0));
    float c = noise(i + vec2(0.0, 1.0));
    float d = noise(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    vec2 st = gl_FragCoord.xy / u_resolution;
    float t = u_time * 0.08;

    float n = smoothNoise(st * 2.5 + vec2(t, t * 0.4));
    n += 0.5 * smoothNoise(st * 5.0 + vec2(t * 1.1, t * 0.7));
    n += 0.25 * smoothNoise(st * 10.0 + vec2(t * 0.6, t * 1.2));
    n /= 1.75;

    vec3 base = vec3(0.039, 0.0, 0.031);
    vec3 surface = vec3(0.067, 0.051, 0.078);
    vec3 crimson = vec3(0.545, 0.102, 0.290);

    vec3 color = mix(base, surface, n * 0.7);
    float bloom = smoothNoise(st * 1.5 + vec2(-t * 0.2, t * 0.3));
    color += crimson * bloom * 0.12;

    gl_FragColor = vec4(color, 1.0);
  }
`

const isCapable = () => {
  try {
    // Check WebGL support
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl')
    if (!gl) return false

    // Low CPU — 2 cores or fewer
    if (navigator.hardwareConcurrency <= 2) return false

    // Low RAM — 2GB or less (not available in all browsers, skip if undefined)
    if (navigator.deviceMemory && navigator.deviceMemory <= 2) return false

    // User prefers reduced motion — respect it
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false

    return true
  } catch {
    return false
  }
}

function StaticBackground() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 0,
      background: `
        radial-gradient(ellipse at 15% 50%, #1a0a14 0%, transparent 60%),
        radial-gradient(ellipse at 85% 20%, #0d0010 0%, transparent 50%),
        radial-gradient(ellipse at 50% 80%, #110008 0%, transparent 60%),
        #0a0008
      `,
    }} />
  )
}

function WebGLBackground() {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas.getContext('webgl')
    if (!gl) return

    const compile = (type, src) => {
      const s = gl.createShader(type)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }

    const prog = gl.createProgram()
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    )

    const pos = gl.getAttribLocation(prog, 'a_position')
    gl.enableVertexAttribArray(pos)
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(prog, 'u_time')
    const uRes = gl.getUniformLocation(prog, 'u_resolution')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    let start = null
    const render = (ts) => {
      if (!start) start = ts
      gl.uniform1f(uTime, (ts - start) / 1000)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      rafRef.current = requestAnimationFrame(render)
    }
    rafRef.current = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        display: 'block',
      }}
    />
  )
}

export default function ShaderBackground() {
  return isCapable() ? <WebGLBackground /> : <StaticBackground />
}
