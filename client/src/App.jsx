import React from 'react'
import Lobby from './pages/Lobby'
import { Route, Routes } from 'react-router-dom'
import Room from './pages/Room'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Lobby />} />
      <Route path="/room/:roomId" element={<Room />} />
    </Routes>
  )
}

export default App