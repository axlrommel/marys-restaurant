// Dependencies
const express = require('express');
const Stack = require('./src/Stack');
const Queue = require('./src/Queue');

const PORT = process.env.PORT || 3001;

let pagerStack;
let pagerQueue;
let emptyTableStack;
let seatedTableQueue;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//init our  stack of pagers and tables
app.post('/initialize', async (req, res) => {
  pagerStack = new Stack([{ pager: '01' }, { pager: '02' }, { pager: '03' }]);
  pagerQueue = new Queue();

  emptyTableStack = new Stack([
    { table: '01' },
    { table: '02' },
    { table: '03' },
  ]);
  seatedTableQueue = new Queue();

  res.json({ pagerStack, pagerQueue, emptyTableStack, seatedTableQueue });
});

app.post('/customerDoneEating', async (req, res) => {
  //customer is done eating left table
  //if theres is a Customer with a Pager than give him the table
  //remove seated table (queue) to an empty table (stack)
  const freeTable = seatedTableQueue.removeFromQueue();
  emptyTableStack.addToStack(freeTable);

  if (pagerQueue.container.length > 0) {
    const pager = pagerQueue.removeFromQueue();
    pagerStack.addToStack(pager);

    const customerTable = emptyTableStack.removeFromStack();
    seatedTableQueue.addToQueue(customerTable);
  }

  res.json({ pagerStack, pagerQueue, emptyTableStack, seatedTableQueue });
});

app.post('/customerCheckIn', async (req, res) => {
  if (emptyTableStack.container.length === 0) {
    const pager = pagerStack.removeFromStack();
    pagerQueue.addToQueue(pager);
    res.status(200).json(pager);
  } else {
    const firstEmptyTable = emptyTableStack.removeFromStack();
    seatedTableQueue.addToQueue(firstEmptyTable);
    res.status(200).json(firstEmptyTable);
  }
});

app.get('/status', (req, res) => {
  res
    .status(200)
    .json({ pagerStack, pagerQueue, emptyTableStack, seatedTableQueue });
});

// Starts the server to begin listening
app.listen(PORT, () => {
  console.log('Server listening on: http://localhost:' + PORT);
});
