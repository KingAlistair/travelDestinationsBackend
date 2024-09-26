import express from 'express';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// Import user and destination router
import usersRouters from './routers/userRouter.js';
import destinationsRouters from './routers/destinationRouter.js';

// Use user and destination router
app.use('/api/users', usersRouters);
app.use('/api/destinations', destinationsRouters);

app.listen(port, () => {
  console.log(`Express server is running on ${port}`);
});
