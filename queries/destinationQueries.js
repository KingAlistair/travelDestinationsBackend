import { MongoClient, ObjectId } from 'mongodb';

// MongoDB connection URI and database name
const uri = 'mongodb://localhost:27017';
const dbName = 'travelDestinations';

// MongoDB client instance
let client;

// Connect to MongoDB
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

// Close the MongoDB connection
async function closeConnection() {
  if (client) {
    await client.close();
    client = null;
    console.log('Disconnected from MongoDB');
  }
}


// Helper function to get the users collection we use it to connect to db and get users 
async function getUsersCollection() {
  const db = await connect();
  return db.collection('users');
}

// Get all destinations from all users
export async function getDestinations() {
  let usersCollection;
  try {
    usersCollection = await getUsersCollection(); // Get the users collection
    const users = await usersCollection.find({}, { projection: { destinations: 1 } }).toArray(); // Get all destinations
    const allDestinations = users.flatMap(user => user.destinations || []); // Flatten the destinations into single array
    return allDestinations; // Return all destinations
  } catch (error) {
    console.error('Failed to fetch destinations:', error); // Log the error 
    throw new Error('Failed to fetch destinations'); // Rethrow the error for further handling
  } finally {
    await closeConnection(); // Ensure the connection is closed in the end
  }
}

// Get all destinations for a specific user
export async function getDestinationsByUserId(email) {
  let usersCollection;
  try {
    usersCollection = await getUsersCollection(); // Get the users collection
    const user = await usersCollection.findOne(
      { email: email }, // Find the user by email
      { projection: { destinations: 1 } } // Project only the destinations array
    );
    return user.destinations || []; // Return destinations or an empty array if no user is found
  } catch (error) {
    console.error('Failed to fetch destinations by user ID:', error); // Log the error if any
    throw new Error('Failed to fetch destinations by user ID'); // Rethrow the error for further handling
  } finally {
    await closeConnection(); // Ensure the connection is closed in the end
  }
}

// Get specific destination by user email and destinitaion id
export async function getDestinationByEmailAndId(userEmail, destinationId) {
  try {
    const usersCollection = await getUsersCollection();

    // Convert destinationId to ObjectId
    const objectId = new ObjectId(destinationId);
    console.log('In query: ' + destinationId)
    // Query to find the specific destination within the user's destinations array
    const user = await usersCollection.findOne(
      {
        email: userEmail, // Find user by email
        destinations: { $elemMatch: { _id: objectId } } // Find destination by _id within the destinations array
      },
      {
        projection: { 'destinations.$': 1 } // Project only the matched destination
      }
    );

    // Return the matched destination if it exists
    return user ? user.destinations[0] : null;
  } catch (error) {
    console.error('Failed to fetch destination:', error);
    throw new Error('Failed to fetch destination');
  } finally {
    await closeConnection();
  }
}

// Create a new destination for a specific user
export async function createDestination(email, destination) {
  try {
    const usersCollection = await getUsersCollection();

    // Create a new destination object with a unique _id
    const newDestination = { _id: new ObjectId(), ...destination };

    // Update the user document identified by email by pushing the new destination to the destinations array
    const result = await usersCollection.updateOne(
      { email: email },
      { $push: { destinations: newDestination } }
    );

    // Check if the destination was added successfully
    if (result.modifiedCount > 0) {
      console.log(`Destination added successfully for user: ${email}`);
      return newDestination;
    } else {
      console.log(`No user found with email: ${email}`);
      return null;
    }
  } catch (error) {
    console.error('Failed to create destination:', error);
    throw new Error('Failed to create destination');
  } finally {
    await closeConnection();
  }
}

// Update a specific destination for a user
export async function updateDestination(userEmail, destinationId, updatedData) {
  try {
    const usersCollection = await getUsersCollection();
    const result = await usersCollection.updateOne(
      {
        email: userEmail, // Find the user by email
        'destinations._id': new ObjectId(destinationId) // Find the destination by _id within the array
      },
      {
        $set: {
          'destinations.$.title': updatedData.title,
          'destinations.$.description': updatedData.description,
          'destinations.$.image': updatedData.image,
          'destinations.$.link': updatedData.link,
          'destinations.$.tag': updatedData.tag
        }
      }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Failed to update destination:', error);
    throw new Error('Failed to update destination');
  } finally {
    await closeConnection();
  }
}

// Delete a specific destination for a user identified by email and destination ID
export async function deleteDestination(userEmail, destinationId) {
  try {
    const usersCollection = await getUsersCollection();

    // Log the inputs for debugging
    console.log('Deleting destination with the following details:');
    console.log('User Email:', userEmail);
    console.log('Destination ObjectId:', destinationId);

    // Convert destinationId to ObjectId
    const objectId = new ObjectId(destinationId);

    // Log ObjectId conversion
    console.log('Converted Destination ObjectId:', objectId);

    // Perform the delete operation using $pull to remove the destination from the array
    const result = await usersCollection.updateOne(
      {
        email: userEmail, // Match user by email
      },
      {
        $pull: { destinations: { _id: objectId } } // Remove the destination with the matching _id
      }
    );

    // Log the result of the delete operation
    console.log('Delete Result:', result);

    // Check if a document was modified
    if (result.modifiedCount === 0) {
      console.log('No document matched the given userEmail and destinationId, or no changes were made.');
    } else {
      console.log('Destination deleted successfully.');
    }

    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Failed to delete destination:', error);
    throw new Error('Failed to delete destination');
  } finally {
    await closeConnection();
  }
}