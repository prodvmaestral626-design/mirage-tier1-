import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ShaderBackground from './components/background/ShaderBackground'
import Home from './pages/Home'
import Chat from './pages/Chat'

export default function App() {
  return (
    <BrowserRouter>
      <ShaderBackground />
      <div style={{
        position: 'relative',
        zIndex: 1,
        height: '100%',
        width: '100%',
      }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
