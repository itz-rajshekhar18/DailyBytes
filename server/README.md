# DailyByte Backend

A Node.js/Express backend for DailyByte, a daily coding knowledge platform.

## Description

DailyByte is a platform that provides daily coding knowledge bytes with examples, quizzes, and categorized content. This backend provides the API for creating and retrieving bytes.

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd dailybyte/server
```

2. Install dependencies
```bash
npm install
```

3. Create a .env file in the server directory with the following variables:
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/DailyByte
```

4. Start the server
```bash
npm run dev
```

## Dependencies

- **express**: Web framework for Node.js
- **mongoose**: MongoDB object modeling tool
- **dotenv**: Load environment variables from .env file
- **cors**: Enable CORS for all routes
- **express-async-handler**: Handle async errors in Express routes
- **morgan**: HTTP request logger middleware

## API Documentation

### Byte Schema

```json
{
  "title": "String (required)",
  "summary": "String (required, 100-200 characters)",
  "example": "String (required, 100-200 characters)",
  "category": "String (required)",
  "datePublished": "Date (default: current date)",
  "quiz": {
    "question": "String (required)",
    "options": ["String (2-4 options required)"],
    "correctAnswer": "String (must be one of the options)"
  },
  "tags": ["String (optional)"]
}
```
## Error Responses

All API endpoints return structured error responses:

```json
{
  "success": false,
  "message": "Error message here",
  "stack": "Error stack trace (only in development mode)"
}
```
Common HTTP status codes:
- 400: Bad Request (validation errors)
- 404: Not Found
- 500: Server Error

### Test Requests

#### 1. Create a Byte
- Method: POST
- URL: http://localhost:5000/api/byte
- Headers: 
  - Content-Type: application/json
- Body (raw JSON):
```json
{
  "title": "JavaScript Promises",
  "summary": "Promises are used in JavaScript to handle asynchronous operations in a cleaner way than callbacks, enabling better code readability and error handling.",
  "example": "const promise = new Promise((resolve, reject) => { setTimeout(() => { resolve('Success!'); }, 1000); }); promise.then(result => console.log(result)).catch(error => console.error(error));",
  "category": "JavaScript",
  "quiz": {
    "question": "What states can a Promise be in?",
    "options": ["Pending/Fulfilled/Rejected", "Running/Stopped", "Active/Inactive", "Start/End"],
    "correctAnswer": "Pending/Fulfilled/Rejected"
  },
  "tags": ["JavaScript", "Async", "ES6"]
}
```

#### 2. Get Today's Byte
- Method: GET
- URL: http://localhost:5000/api/byte/today

#### 3. Get All Bytes
- Method: GET
- URL: http://localhost:5000/api/byte

#### 4. Get Bytes by Category
- Method: GET
- URL: http://localhost:5000/api/byte/category/JavaScript

#### 5. Get All Categories
- Method: GET
- URL: http://localhost:5000/api/byte/category

## Additional Notes

- The backend automatically validates that:
  - Summary and example are between 100-200 characters
  - Quiz has 2-4 options
  - Correct answer is one of the options
- The datePublished field defaults to the current date/time if not specified
- You can optionally provide a specific datePublished in the request body when creating a byte

## Troubleshooting

- If you encounter connection issues with MongoDB, ensure your MongoDB service is running
- Check that your MONGO_URI in the .env file is correct
- For validation errors, check the error response for specific details about what failed validation
