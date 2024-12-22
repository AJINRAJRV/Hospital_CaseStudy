
const fs = require('fs').promises; // Use promises-based version of fs
const path = require('path');

const filePath = path.join(__dirname, 'hospitalData.json');

// Utility function to read data asynchronously from the JSON file
const readData = async () => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading file:', error);
    return [];
  }
};

// Utility function to write data asynchronously to the JSON file
const writeData = async (data) => {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing file:', error);
  }
};

// Function to handle incoming requests
const handleRequest = async (req, res) => {
  const { method, url } = req;

  if (url === '/hospitals' && method === 'GET') {
    // GET: Retrieve all hospital records
    try {
      const hospitals = await readData();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(hospitals));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Internal Server Error' }));
    }

  } else if (url === '/hospitals' && method === 'POST') {
    // POST: Add a new hospital record
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const newHospital = JSON.parse(body);
        const hospitals = await readData();
        newHospital.id = hospitals.length ? hospitals[hospitals.length - 1].id + 1 : 1; // Auto-increment ID
        hospitals.push(newHospital);
        await writeData(hospitals);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Hospital added successfully', hospital: newHospital }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Internal Server Error' }));
      }
    });

  } else if (url.startsWith('/hospitals/') && method === 'PUT') {
    // PUT: Update an existing hospital record
    const id = parseInt(url.split('/')[2]);
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const updatedHospitalData = JSON.parse(body);
        const hospitals = await readData();
        const index = hospitals.findIndex((hospital) => hospital.id === id);
        
        if (index !== -1) {
          hospitals[index] = { ...hospitals[index], ...updatedHospitalData };
          await writeData(hospitals);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Hospital updated successfully', hospital: hospitals[index] }));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Hospital not found' }));
        }
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Internal Server Error' }));
      }
    });

  } else if (url.startsWith('/hospitals/') && method === 'DELETE') {
    // DELETE: Delete a hospital record
    const id = parseInt(url.split('/')[2]);
    try {
      const hospitals = await readData();
      const filteredHospitals = hospitals.filter((hospital) => hospital.id !== id);

      if (hospitals.length !== filteredHospitals.length) {
        await writeData(filteredHospitals);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Hospital deleted successfully' }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Hospital not found' }));
      }
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Internal Server Error' }));
    }

  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Route not found' }));
  }
};

module.exports = { handleRequest };
