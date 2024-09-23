import express from 'express';
const usersRouter = express.Router();

import {
  getUsers,
  getUserById,
  getUserByEmail,
  toggleUserLoggedInStatus,
  createUser
} from '../queries/userQueries.js';


// GET all users
usersRouter.get('/', async (req, res) => {
  try {
    const users = await getUsers();
    res.json(users); // Send the users as JSON response of the users
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});


// GET user by ID
usersRouter.get('/id/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    console.log("Received userId:", userId);

    const user = await getUserById(userId);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});


// GET user by email
usersRouter.get('/email/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const user = await getUserByEmail(email);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});


// POST new user
usersRouter.post('/', async (req, res) => {
  try {
    const newUser = req.body;
    console.log('Creating user with data:', newUser); // Log the new user
    const userId = await createUser(newUser); // Save the new user and get the inserted ID
    res.status(201).json({ ...newUser, id: userId }); // Respond with the created user including the ID
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});


// Toggle the loggedIn status of a user by email
usersRouter.patch('/email/:email/toggle_status', async (req, res) => {
  try {
    const email = req.params.email;
    const result = await toggleUserLoggedInStatus(email);

    res.json({
      message: `User ${result.email} loggedIn status changed to ${result.isLoggedIn}`,
    });
  } catch (error) {
    console.error('Error in toggling user login status:', error);
    res.status(500).json({ error: 'Failed to toggle user loggedIn status' });
  }
});

// USER AUTHENTICATION 


export default usersRouter;