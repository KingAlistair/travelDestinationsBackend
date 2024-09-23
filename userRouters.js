// routers.js
import express from 'express';
const router = express.Router();


import { getUsers, createUser } from './userQueries.js';



// GET users
router.get('/', async (req, res) => {
  try {
    const users = await getUsers(); // Use await to get the resolved value
    res.json(users); // Send the users as JSON response
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST user
router.post('/', async (req, res) => {
  try {
    const newUser = req.body;
    console.log('Creating user with data:', newUser); // Log the incoming data
    const userId = await createUser(newUser); // Save the new user and get the inserted ID
    res.status(201).json({ ...newUser, id: userId }); // Respond with the created user including the ID
  } catch (error) {
    console.error('Error creating user:', error); // Log any error
    res.status(500).json({ error: 'Failed to create user' });
  }
});



export default router;