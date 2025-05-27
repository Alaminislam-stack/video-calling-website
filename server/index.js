const { Server } = require('socket.io')

const io = new Server(3000, {
   cors: true
})

const emailToSocketIdMapping = new Map();
const socketIdToEmailMapping = new Map();

io.on('connection', (socket) => {
   console.log(`A user connected: ${socket.id}`)
   socket.on('join:room', (data) => {
      const { email, room } = data;
      emailToSocketIdMapping.set(email, socket.id);
      socketIdToEmailMapping.set(socket.id, email);
      io.to(room).emit('user:joined', { email, id: socket.id });
      socket.join(room);
      io.to(socket.id).emit('join:room', data)
   })

   socket.on('call:user', ({ offer, to}) => {
      io.to(to).emit('incoming:call', { from: socket.id, offer });
   } )

   socket.on('call:accepted', ({to, ans}) => {
      io.to(to).emit("call:accepted", { from: socket.id, ans });

   })
   
   socket.on('peer:nego:neede', ({to, offer}) =>{
      io.to(to).emit("peer:nego:neede", { from: socket.id, offer });
   })
   
   socket.on("peer:nego:done", ({ to, ans }) => {
      io.to(to).emit('peer:nago:final', { from: socket.id, ans });
   });



})

