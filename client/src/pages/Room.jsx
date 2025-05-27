import React, { useEffect } from 'react'
import { useSocket } from '../context/Socker'
import { useState } from 'react'
import { use } from 'react'
import { useCallback } from 'react'
import ReactPlayer from 'react-player'
import peer from '../service/peer'


const Room = () => {

 const {socket} = useSocket()
 const [remoteSocketId, setRemoteSocketId] = useState(null)
 const [myStream, setMyStream] = useState()
 const [remoteStream, setRemoteStream] = useState();
 
  // This function will be called when a user joins the room
  // It will log the email and id of the user who joined
  // You can also update the state or perform any other action here

 const handleUserJoined = useCallback(({email, id}) => {
    console.log(`User joined: ${email} with id: ${id}`);
    setRemoteSocketId(id);
 },[])

 const handleCallUser = useCallback(async () => {
   const stream = await navigator.mediaDevices.getUserMedia({
     video: true,
     audio: true,
   });
   const offer = await peer.getOffer();
   console.log("offer", offer);
   socket.emit("call:user", { offer, to: remoteSocketId });
   setMyStream(stream);
 }, [remoteSocketId, socket]);

const handleIncomingCall = useCallback( async({from, offer}) => {
    setRemoteSocketId(from);
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setMyStream(stream);

   console.log('incomeing call from', from, offer)
   const ans = await peer.getAnswer(offer)
   socket.emit('call:accepted', {to: from, ans})
   
},[socket])

const sendStream = useCallback( () => {
  for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream)
    }
},[myStream])

const handleCallAccepted = useCallback(({ from, ans}) => {
    peer.setLocalDescription(ans)
    console.log('call accepted from')
    sendStream()
}, [sendStream]);

const handleNagoNeeded = useCallback(async () => {
     const offer = await peer.getOffer();
      socket.emit("peer:nego:neede", { offer, to: remoteSocketId });
   })

const handleNagoNeedIncoming = useCallback( async ({ from, offer }) => {
  const ans = await peer.getAnswer(offer)
  socket.emit('peer:nego:done', {to: from, ans})
}, [socket]);

const handleNagoNeedFinal = useCallback( async ({ans}) => {
    await peer.setLocalDescription(ans)
    
},[])


useEffect(() => {
   peer.peer.addEventListener("negotiationneeded", handleNagoNeeded);
   return () => {
     peer.peer.removeEventListener("negotiationneeded", handleNagoNeeded);  
   }
},[handleNagoNeeded])

 useEffect(() => {
  peer.peer.addEventListener('track', async ev => {
    const remoteStream = ev.streams
    console.log('got track')
    setRemoteStream(remoteStream[0]);
  })
 },[])


 useEffect(() => {
   socket.on("user:joined", handleUserJoined);
   socket.on("incoming:call", handleIncomingCall);
   socket.on("call:accepted", handleCallAccepted);
   socket.on("peer:nego:neede", handleNagoNeedIncoming);
   socket.on("peer:nago:final", handleNagoNeedFinal);
   return () => {
     socket.off("user:joined", handleUserJoined);
     socket.off("incoming:call", handleIncomingCall);
     socket.off("call:accepted", handleCallAccepted);
     socket.off("peer:nego:neede", handleNagoNeedIncoming);
     socket.off("peer:nago:final", handleNagoNeedFinal);
   };
 }, [
   socket,
   handleUserJoined,
   handleIncomingCall,
   handleCallAccepted,
   handleNagoNeedIncoming,
   handleNagoNeedFinal,
 ]);


  return (
    <div className=" flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-4xl ">Room</h1>
      <h4>{remoteSocketId ? "connected" : "No user joined"}</h4>
      {myStream && <button onClick={sendStream}>send stream</button>}
      {remoteSocketId && (
        <button
          className=" cursor-pointer px-5 py-2 border border-gray-400"
          onClick={handleCallUser}
        >
          Call
        </button>
      )}
      {myStream && (
        <>
          <h1>my stream</h1>
          <ReactPlayer url={myStream} playing controls={true} />
        </>
      )}

      {remoteStream && (
        <>
          <h1>remote stream</h1>
          <ReactPlayer url={remoteStream} playing controls={true} />
        </>
      )}
    </div>
  );
}

export default Room