# HOW TO RUN THE PROJECT

1. First, git clone the project into a directory
2. Set environment variables in your .env file
   GOOGLE_APPLICATION_CREDENTIALS="firebase_service_account.json"
   REACT_APP_FIREBASE_API_KEY=<YOUR_FIREBASE_PROJECT_API_KEY>
   BACKEND_PORT=3002
   Note that the "firebase_service_account.json" file should be downloaded from the Firebase website.
   You can find it on the top left in Project Overview --> Project settings --> Service accounts -->
   Generate new private key. And then move this .json file to the root of the project directory.
3. Install all dependencies (including new ones) by running in terminal 'npm install'
4. Launch the frontend code 'npm start' in terminal
5. Launch the backend code 'node --env-file=<PATH*TO*.ENV_FILE> <PATH_TO_APP.JS_FILE>'

locally:
docker build -t codinginterview-me .
docker run -p 3002:3002 --env-file .env codinginterview-me

deploying:
docker buildx create --name multi-builder --use
docker buildx inspect --bootstrap

docker buildx build \
 --platform linux/amd64,linux/arm64 \
 -t northamerica-northeast1-docker.pkg.dev/codinginterview-me/codinginterview-me/codinginterview-me:latest \
 --push .
