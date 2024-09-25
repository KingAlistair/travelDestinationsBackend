import { MongoClient, ObjectId } from 'mongodb';

const uri = 'mongodb://localhost:27017';
const dbName = 'travelDestinations';

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

async function closeConnection() {
    if (client) {
        await client.close();
        client = null;
        console.log('Disconnected from MongoDB');
    }
}

async function runQueries() {
    const db = await connect();
    const usersCollection = db.collection('users');

    try {
        // 1. Get all users that have at least one destination with both image and description
        const usersWithImageAndDescription = await usersCollection.find({
            'destinations': {
                $elemMatch: {
                    image: { $exists: true },
                    description: { $exists: true }
                }
            }
        }).toArray();
        console.log('Users with destinations that have both image and description:', usersWithImageAndDescription);


        // 2. Get users who are logged in or have more than 1 destination
        const loggedInOrManyDestinations = await usersCollection.find({
            $or: [
                { isLoggedIn: true },
                { 'destinations.1': { $exists: true } }
            ]
        }).toArray();
        console.log('Users who are logged in or have more than 1 destination:', loggedInOrManyDestinations);


        // 3. Get all users who have no destinations
        const usersWithNoDestinations = await usersCollection.find({
            $or: [
                { destinations: { $exists: false } },
                { destinations: { $eq: [] } }
            ]
        }).toArray();
        console.log('Users with no destinations:', usersWithNoDestinations);


        // 4. Get users who have destinations tagged with a specific tag (can be sorted by country name)
        const tag = "Spain";
        const usersWithSpecificTag = await usersCollection.find({
            'destinations.tag': tag
        }).toArray();
        console.log(`Users with destinations tagged with "${tag}":`, usersWithSpecificTag);


        // 5. Find users created before a certain date - Problem: createdOn is created as string
        /*
        const cutoffDate = new Date("2024-03-05");
        const usersCreatedBeforeDate = {
            createdOn: { $lt: cutoffDate } // Find users with createdOn date less than cutoffDate
        };
        const usersBeforeDate = await usersCollection.find(usersCreatedBeforeDate).toArray();
        console.log('Users Created Before March 5, 2024:', usersBeforeDate); */


    } catch (error) {
        console.error('Error running queries:', error);
    } finally {
        await closeConnection();
    }
}

runQueries();
