// const express=require('express');

// const app=new express();

// const homeRouter=require('./routes/routing')

// app.use('/routing',homeRouter);

// app.listen(3000,()=>{
//     console.log("Server is listening on PORT number 3000");
// })

const http = require('http');
const routing = require('./routes/routing');

const PORT = 3000;

const server = http.createServer((req, res) => {
  routing.handleRequest(req, res);
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
