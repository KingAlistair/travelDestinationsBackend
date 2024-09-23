import express, { json } from 'express';
const app = express();
const port = 3000;

app.use(express.json());

// Import user router
import usersRouters from './routers/userRouters.js';
import destinationsRouters from './routers/destinationRouters.js';

// Use user router
app.use('/api/users', usersRouters);
app.use('/api/destinations', destinationsRouters);

app.listen(port, () => {
  console.log(`Express server is running on ${port}`);
});
