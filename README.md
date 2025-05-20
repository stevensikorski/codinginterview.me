# [codinginterview.me](https://codinginterview.me)

[codinginterview.me](https://codinginterview.me) is a comprehensive web platform designed to simulate real coding interview experiences. By combining collaborative real-time code editing via Monaco Editor with WebRTC-powered video conferencing, our application allows users to practice technical interviews in an authentic environment. Built with React on the frontend and Express.js for the backend, our system features a curated library of coding challenges across difficulty levels, real-time code execution through Judge0 API, and synchronized code sharing via Socket.IO. Our platform supports interviewer and interviewee roles, providing a complete end-to-end solution for technical interview preparation, execution, and feedback.

## Technologies and Packages

- Docker
- Express.js
- Figma
- Firebase
- GitHub
- Google Cloud Platform
- Judge0 API
- Lucide React
- Monaco Editor
- Node.js
- PostCSS
- React
- React Markdown
- React Router
- Socket.IO
- Squarespace
- Tailwind CSS
- WebRTC

## Install and Run

```bash
git clone https://github.com/stevensikorskicodinginterview.me.git
cd codinginterview.me
npm install
```

```bash
npm start
```

```bash
node --env-file=./.env ./src/App.js
```

## Environment Variables

```env
FIREBASE_SERVICE_KEY=
REACT_APP_FIREBASE_API_KEY=
REACT_APP_RAPIDAPI_KEY=
REACT_APP_RAPIDAPI_HOST=
REACT_APP_BACKEND_HOST=
REACT_APP_FRONTEND_HOST=
BACKEND_PORT=
```

FIREBASE_SERVICE_KEY:

```bash
base64 firebase_service_account.json
```

REACT_APP_FIREBASE_API_KEY:

```
Firebase > Project Settings > Web API Key
```

REACT_APP_RAPIDAPI_KEY:

```
RapidAPI > Console > Application > Application Key
```

REACT_APP_RAPIDAPI_HOST:

```
judge0-ce.p.rapidapi.com
```

REACT_APP_BACKEND_HOST:

```
http://localhost:3002
```

REACT_APP_FRONTEND_HOST:

```
http://localhost:3000
```

BACKEND_PORT:

```
3002
```

## Deployment

### Frontend Deployment:

- **Firebase Hosting** is used to deploy the React frontend app
- **GitHub Actions** is setup for the CI/CD

### Backend Deployment:

- **Google Cloud Platform** via **Cloud Run** hosts the backend Express.js server
- **Docker** is used to containerize the backend service

### Live Demo:

The application is deployed and accessible at [codinginterview.me](https://codinginterview.me)
