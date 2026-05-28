# DevPulse

DevPulse is an internal tech issue and feature tracker. It's a collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions.

## 🚀 Getting Started

These instructions will help you set up the project on your local machine for development and testing.

### Prerequisites

Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [PostgreSQL](https://www.postgresql.org/) (for the database)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Nazmul1211/devpulse.git
   cd devpulse
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and add the necessary variables:
   ```env
   PORT=5000
   DATABASE_URL=your_postgres_database_url
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   The API should now be running at `http://localhost:5000`.

## 🛠️ Built With

- **[TypeScript](https://www.typescriptlang.org/)** - For writing type-safe code.
- **[Express](https://expressjs.com/)** - Fast, unopinionated web framework for Node.js.
- **[PostgreSQL (pg)](https://node-postgres.com/)** - Relational Database for storing data securely.

## 📂 Project Structure

A quick look at the main folders inside the `src/` directory to help you navigate:

- `app.ts` - Main Express application setup (middlewares, routes).
- `server.ts` - Entry point that starts the server.
- `modules/` - Contains our main application features (`auth` and `issues`). Each module is scoped to hold its own code (e.g., controllers, services, routes).
- `db/` - Database connection configuration.
- `middleware/` - Custom Express middlewares (like authentication and error handlers).
- `utils/` - Shared helper functions.

## 📝 Available Scripts

- `npm run dev` - Starts the app in development mode with automatic reloading.
- `npm run build` - Compiles the TypeScript code into JavaScript in the `dist/` folder.
- `npm start` - Starts the production server using the compiled code.
