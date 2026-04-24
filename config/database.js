const mongoose = require('mongoose');

/**
 * Database - Singleton Pattern
 * Ensures only one database connection is created throughout the app lifecycle.
 */
class Database {
  constructor() {
    if (Database._instance) {
      return Database._instance;
    }
    Database._instance = this;
    this.connection = null;
  }

  static getInstance() {
    if (!Database._instance) {
      Database._instance = new Database();
    }
    return Database._instance;
  }

  async connect() {
    if (this.connection) {
      console.log('Database: Reusing existing connection (Singleton).');
      return this.connection;
    }

    try {
      this.connection = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('Database: New connection established.');
      return this.connection;
    } catch (err) {
      console.error('Database connection error:', err.message);
      process.exit(1);
    }
  }

  getConnection() {
    return this.connection;
  }
}

Database._instance = null;

module.exports = Database;
