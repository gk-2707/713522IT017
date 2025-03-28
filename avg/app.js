require('dotenv').config();
const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 9876;

const WINDOW_SIZE = 10;
const windowState = [];

// Valid Token
const token = process.env.JWT_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQzMTUzODMzLCJpYXQiOjE3NDMxNTM1MzMsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImRjNTI2YTM4LWEyOTQtNGRjMC1iNTViLWVjODY1ZjQxYzgwZiIsInN1YiI6ImdnazcxMDMwNkBnbWFpbC5jb20ifSwiY29tcGFueU5hbWUiOiJnb01hcnQiLCJjbGllbnRJRCI6ImRjNTI2YTM4LWEyOTQtNGRjMC1iNTViLWVjODY1ZjQxYzgwZiIsImNsaWVudFNlY3JldCI6IkxPQURoYm5meVdObEF5V2EiLCJvd25lck5hbWUiOiJSYWh1bCIsIm93bmVyRW1haWwiOiJnZ2s3MTAzMDZAZ21haWwuY29tIiwicm9sbE5vIjoiNzEzNTIyMDE3In0.2OXiW793ApBSqMBndYmm5nMo9Y8iAa7I5-kmUVPMNMk';

const NUMBER_APIS = {
  primes: 'http://20.244.56.144/test/primes',
  fibonacci: 'http://20.244.56.144/test/fibonacci',
  even: 'http://20.244.56.144/test/even',
  random: 'http://20.244.56.144/test/random'
};

// Function to validate JWT token
const isValidToken = () => {
  try {
    const decoded = jwt.decode(token, { complete: true });

    if (!decoded) {
      console.error('❌ Invalid token');
      return false;
    }

    const { exp } = decoded.payload;
    const now = Math.floor(Date.now() / 1000);

    if (exp < now) {
      console.error('❌ Token has expired');
      return false;
    }

    console.log('✅ Token is valid');
    return true;
  } catch (err) {
    console.error(`❌ Error validating token: ${err.message}`);
    return false;
  }
};

// ✅ Universal handler for all endpoints
app.get('/numbers/:type', async (req, res) => {
  const type = req.params.type.toLowerCase();

  if (!NUMBER_APIS[type]) {
    return res.status(400).json({ error: 'Invalid number type' });
  }

  // ✅ Check if the token is valid before making the request
  if (!isValidToken()) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  try {
    const startTime = Date.now();

    // 🔥 Fetch data from external API with 500ms timeout
    const response = await axios.get(NUMBER_APIS[type], {
      timeout: 500,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const responseTime = Date.now() - startTime;
    if (responseTime > 500) throw new Error('Response time exceeded 500ms');

    const numbers = response.data.numbers || [];

    // ✅ Store unique values and maintain window size
    const previousState = [...windowState];
    numbers.forEach(num => {
      if (!windowState.includes(num)) {
        if (windowState.length >= WINDOW_SIZE) {
          windowState.shift(); // ✅ Remove oldest value if window size exceeds limit
        }
        windowState.push(num);
      }
    });

    // ✅ Calculate average
    const avg = windowState.length
      ? windowState.reduce((sum, n) => sum + n, 0) / windowState.length
      : 0;

    // ✅ Send response
    return res.json({
      windowPrevState: previousState,
      windowCurrState: windowState,
      numbers,
      avg: avg.toFixed(2)
    });
  } catch (error) {
    console.error(`❌ Error fetching data: ${error.message}`);

    if (error.response) {
      if (error.response.status === 401) {
        return res.status(401).json({ error: 'Unauthorized - Invalid token' });
      }
      if (error.response.status === 404) {
        return res.status(404).json({ error: 'Not Found - Invalid endpoint' });
      }
      return res.status(error.response.status).json({ error: error.response.data });
    }

    return res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// ✅ Test endpoint to check token status
app.get('/check-token', (req, res) => {
  if (isValidToken()) {
    res.status(200).json({ status: '✅ Valid token' });
  } else {
    res.status(401).json({ status: '❌ Invalid or expired token' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🔗 Test Endpoints:`);
  console.log(`➡️ Check Token: http://localhost:${PORT}/check-token`);
  console.log(`➡️ Get Primes: http://localhost:${PORT}/numbers/primes`);
  console.log(`➡️ Get Fibonacci: http://localhost:${PORT}/numbers/fibonacci`);
  console.log(`➡️ Get Even: http://localhost:${PORT}/numbers/even`);
  console.log(`➡️ Get Random: http://localhost:${PORT}/numbers/random`);
});
