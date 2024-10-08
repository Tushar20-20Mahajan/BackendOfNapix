const jwt = require('jsonwebtoken');
const AssignedTrucks = require('../Models/AssignedTrucks');
const Route = require('../Models/Route');
const { JWT_SECRET } = process.env;
const mongoose = require("mongoose");

// Helper function to check if a truck is already connected
const isTruckConnected = (vehicleNumber) => global.connectedTrucks.includes(vehicleNumber);

const authenticate = (socket, next) => {
    const token = socket.handshake.headers['authorization']?.replace('Bearer ', '');
    console.log('Received token:', token); // Add logging
    if (!token) return next(new Error('Authentication error'));

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return next(new Error('Authentication error'));
        socket.user = decoded;
        next();
    });
};




const handleConnection = (io) => (socket) => {
    console.log('New client connected');

    socket.on('getConnectedTrucks', () => {
        if (socket.user.role !== 'logistics_head') {
            socket.emit('message', 'Unauthorized access');
            return;
        }
        socket.emit('connectedTrucks', global.connectedTrucks);
    });

    socket.on('getConnectedTrucks', () => {
        if (socket.user.role !== 'logistics_head') {
            socket.emit('message', 'Unauthorized access');
            return;
        }
        socket.emit('connectedTrucks', global.connectedTrucks);
    });

    socket.on('joinRoom', async (vehicleNumber) => {
        try {
            if (socket.user.role === 'driver') {
                // Check if the driver is already in the room
                if (socket.rooms.has(vehicleNumber)) {
                    socket.emit('message', `You are already connected to vehicle: ${vehicleNumber}`);
                    return;
                }

                // Check if the vehicle is assigned to any driver
                const assignedTruck = await AssignedTrucks.findOne({ vehicleNumber });
                if (!assignedTruck) {
                    socket.emit('message', 'You are not assigned to this vehicle. Access denied.');
                    return;
                }

                // Join the room
                socket.join(vehicleNumber);
                await Route.updateOne({ vehicleNumber }, { status: 'driving safely' });
                
                global.connectedTrucks.push(vehicleNumber);
                socket.emit('message', `Successfully joined the room for vehicle: ${vehicleNumber}`);
            } else if (socket.user.role === 'logistics_head') {
                socket.emit('message', 'Logistics head connected');
            } else {
                socket.emit('message', 'Invalid role');
            }
        } catch (error) {
            console.error('Error joining room:', error);
            socket.emit('message', 'An error occurred while trying to join the room');
        }
    });

    socket.on('sendMessage', async (vehicleNumber, message) => {
        try {
            if (socket.rooms.has(vehicleNumber)) {
                await Route.findOneAndUpdate(
                    { vehicleNumber },
                    {
                        $push: {
                            messages: {
                                message,
                                timestamp: new Date()
                            }
                        }
                    },
                    { upsert: true, new: true }
                );

                await Route.findOneAndUpdate(
                    { vehicleNumber },
                    { status: 'active alerts' },
                    { new: true }
                );

                // Emit to truck room
                io.to(vehicleNumber).emit('message', message);

                // Emit to all logistics heads
                io.sockets.sockets.forEach(client => {
                    if (client.user && client.user.role === 'logistics_head') {
                        client.emit('message', `New message for truck ${vehicleNumber}: ${message}`);
                    }
                });
            } else {
                socket.emit('message', 'You are not allowed to send messages from this room.');
            }
        } catch (error) {
            console.error('Error handling sendMessage:', error);
            socket.emit('message', 'An error occurred while sending the message.');
        }
    });

    // Fetch messages from the Route schema for a specific vehicle
socket.on('getMessages', async (vehicleNumber) => {
    try {
        const route = await Route.findOne({ vehicleNumber });

        if (route && route.messages.length > 0) {
            socket.emit('chatMessages', route.messages);
        } else {
            socket.emit('chatMessages', []);  // Send an empty array if no messages
        }
    } catch (error) {
        console.error('Error retrieving messages:', error);
        socket.emit('message', 'An error occurred while retrieving messages.');
    }
});


    socket.on('endRoute', async (vehicleNumber) => {
        try {
            if (!socket.rooms.has(vehicleNumber)) {
                socket.emit('message', 'You are not in the room for this vehicle.');
                return;
            }

            socket.leave(vehicleNumber);
            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                const truckResult = await AssignedTrucks.deleteOne({ vehicleNumber }).session(session);
                if (truckResult.deletedCount === 0) {
                    await session.abortTransaction();
                    session.endSession();
                    socket.emit('message', `Vehicle ${vehicleNumber} was not found in the assigned list.`);
                    return;
                }

                await Route.deleteMany({ vehicleNumber }).session(session);
                await session.commitTransaction();
                session.endSession();

                global.connectedTrucks = global.connectedTrucks.filter(truck => truck !== vehicleNumber);
                io.to(vehicleNumber).emit('message', `Route has ended. You have left the room for vehicle ${vehicleNumber}.`);
            } catch (error) {
                await session.abortTransaction();
                throw error;
            }
        } catch (error) {
            console.error('Error ending route:', error);
            socket.emit('message', 'An error occurred while ending the route.');
        }
    });
    
    socket.on('disconnect', () => {
        global.connectedTrucks.forEach(truckNumber => {
            if (socket.rooms.has(truckNumber)) {
                global.connectedTrucks = global.connectedTrucks.filter(truck => truck !== truckNumber);
            }
        });

        // Additional cleanup for logistics head clients
        if (socket.user && socket.user.role === 'logistics_head') {
            // Handle logistics head disconnection if necessary
        }
    });
};

module.exports = { authenticate, handleConnection };
