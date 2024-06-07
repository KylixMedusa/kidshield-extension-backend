# KidShield Extension Backend

KidShield Extension Backend is built to support the KidShield browser extension and the parental dashboard, providing APIs for content filtering, activity monitoring, and user management. This backend is built with Node.js, using TypeScript for type safety, and managed with pnpm.

## Features

- **Content Filtering API:** Provides endpoints to filter inappropriate content.
- **Activity Monitoring:** Stores and retrieves browsing activity data.
- **User Management:** Handles user authentication and settings management.
- **Redis Integration:** Utilizes Redis for caching and session management.
- **Type Safety:** Built with TypeScript for improved reliability.
- **Efficient Package Management:** Uses pnpm for faster, more efficient dependency management.

## Installation

To install the KidShield Extension Backend, follow these steps:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/KylixMedusa/kidshield-extension-backend.git
   cd kidshield-extension-backend
   ```

2. **Install Dependencies:**
   Ensure you have pnpm installed. Then, install the required dependencies:
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your environment variables. An example `.env` file might look like this:
   ```plaintext
   PORT=3000
   OPEN_AI_ACCESS_KEY=your_openai_access_key
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DB_NAME=kidshield
   JWT_SECRET=your_jwt_secret
   REDIS_URL=redis://localhost:6379
   REDISCLI_AUTH=your_redis_password
   ```

4. **Run the Development Server:**
   Start the development server to see the backend in action:
   ```bash
   pnpm run dev
   ```

## Usage

1. **Starting the Server:**
   Once the server is running, it will listen for API requests on the specified port (default is 3000).

2. **Interacting with the API:**
   Use tools like Postman or curl to interact with the API endpoints for content filtering, activity monitoring, and user management.

## Redis Setup

To set up Redis for the KidShield Extension Backend, follow these steps:

1. **Install Redis:**
   Follow the installation instructions for your operating system from the [official Redis documentation](https://redis.io/download).

2. **Start Redis Server:**
   Once installed, start the Redis server with the default configuration:
   ```bash
   redis-server
   ```

3. **Configure Redis Authentication (Optional):**
   If you want to set up authentication, modify your Redis configuration file (usually `redis.conf`) to include:
   ```plaintext
   requirepass your_redis_password
   ```
   Restart the Redis server after making changes.

4. **Set Environment Variables:**
   Ensure that the `REDIS_URL` and `REDISCLI_AUTH` variables are correctly set in your `.env` file:
   ```plaintext
   REDIS_URL=redis://localhost:6379
   REDISCLI_AUTH=your_redis_password
   ```

## API Endpoints

Refer to the API documentation for detailed information on each endpoint.
[API Documentation](KidShield.postman_collection.json)

## Contributing

We welcome contributions from the community! To contribute to KidShield Extension Backend, follow these steps:

1. **Fork the Repository:**
   Click the "Fork" button at the top right of the repository page to create a copy of the repo under your GitHub account.

2. **Clone the Forked Repository:**
   ```bash
   git clone https://github.com/your-username/kidshield-extension-backend.git
   cd kidshield-extension-backend
   ```

3. **Create a New Branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make Changes and Commit:**
   Implement your changes and commit them with a descriptive message:
   ```bash
   git add .
   git commit -m "Add feature: your-feature-name"
   ```

5. **Push to Your Fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Submit a Pull Request:**
   Go to the original repository on GitHub and submit a pull request with a detailed description of your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.