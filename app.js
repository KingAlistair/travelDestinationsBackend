import express, { json } from 'express';
const app = express();
const port = 3000;

app.use(express.json());

// Import user router
import userRouters from './userRouters.js';

// Use user router
app.use('/api/users/', userRouters);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
