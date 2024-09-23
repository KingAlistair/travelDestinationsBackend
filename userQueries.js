// userQueries.js
import { MongoClient } from 'mongodb';

// MongoDB connection URI and database name
const uri = 'mongodb://localhost:27017';
const dbName = 'eLearning';

// MongoDB client instance
let client;

async function connect() {
    if (!client) {
        client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        try {
            await client.connect();
            console.log('Connected to MongoDB');
        } catch (error) {
            console.error('Failed to connect to MongoDB', error);
            throw error;
        }
    }
    return client.db(dbName);
}

// Create a new user
async function createUser(user) {
    const db = await connect(); 
    try {
        const result = await db.collection('users').insertOne(user);
        if (result.acknowledged) {
            console.log('User created with ID:', result.insertedId); // Log the inserted ID
            return result.insertedId;
        } else {
            throw new Error('Failed to insert user');
        }
    } catch (error) {
        console.error('Error creating user:', error); // Log any error
        throw error; // Rethrow the error to be caught in the route handler
    }
}

// Get a user by email
async function getUsers() {
    const db = await connect();
    const user = await db.collection('users').find({}).toArray();
    return user;
}

// Get a user by email
async function getUserByEmail(email) {
    const db = await connect();
    const user = await db.collection('users').findOne({ email });
    return user;
}

// Update a user by email
async function updateUserByEmail(email, updates) {
    const db = await connect();
    const result = await db.collection('users').updateOne({ email }, { $set: updates });
    return result.modifiedCount;
}

// Delete a user by email
async function deleteUserByEmail(email) {
    const db = await connect();
    const result = await db.collection('users').deleteOne({ email })
    return result.deletedCount;
}

// Close the MongoDB connection
async function closeConnection() {
    if (client) {
        await client.close();
        client = null;
        console.log('Disconnected from MongoDB');
    }
}

// Export the CRUD functions
export {
    getUsers,
    createUser,
    getUserByEmail,
    updateUserByEmail,
    deleteUserByEmail,
    closeConnection
};
