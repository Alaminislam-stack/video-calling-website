import React, {useCallback, useEffect, useState, } from 'react'
import { useSocket } from '../context/Socker'
import { useNavigate } from 'react-router-dom';

const Lobby = () => {

  const [email, setEmail] = useState('');
  const [room, setRoom] = useState('');
  const {socket} = useSocket();
  const navigate = useNavigate();

const handleSubmit = useCallback((e) => {
    e.preventDefault();
    socket.emit('join:room', {email, room});
}, [email, room, socket]);

const handleJoinRoom = useCallback((data) => {
    const {email, room} = data;
    navigate(`/room/${room}`);
}, [navigate]);


  useEffect(() => {
    socket.on('join:room', handleJoinRoom);
    return () => {
      socket.off('join:room', handleJoinRoom);
    }
  }, [socket]);


  return (
    <div className='p-4 flex flex-col items-center justify-center h-screen bg-gray-200 gap-7'>
        <h1 className='text-2xl font-bold'>Lobby</h1> 
        <form onSubmit={handleSubmit} className=' bg-gray-300 flex flex-col lg:flex-row justify-center items-center gap-4 p-4'>
            <label>Email ID</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} name="email" required className='p-2 border border-gray-400 rounded-lg' />
            <label>Room ID</label>
            <input type="text" id="room" value={room} onChange={(e) => setRoom(e.target.value)} name="room" required className='p-2 border border-gray-400 rounded-lg' />
            <button type="submit" className='bg-blue-500 text-white p-2 rounded-lg'>Join</button>
        </form>
    </div>
  )
}

export default Lobby