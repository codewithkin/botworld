// /lib/sqlite.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

class SQLiteDB {
  constructor() {
    this.db = new sqlite3.Database(path.join(__dirname, "../data/bot-data.db"));
    this.initializeDatabase();
  }

  async initializeDatabase() {
    return new Promise((resolve, reject) => {
      this.db.run(
        `
        CREATE TABLE IF NOT EXISTS bot_config (
          botId TEXT PRIMARY KEY,
          userId TEXT,
          assistantId TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `,
        (err) => {
          if (err) {
            console.error("Error initializing database:", err);
            reject(err);
          } else {
            console.log("SQLite database initialized");
            resolve();
          }
        }
      );
    });
  }

  async setBotConfig(botId, key, value) {
    return new Promise((resolve, reject) => {
      // First check if botId exists
      this.db.get(
        "SELECT botId FROM bot_config WHERE botId = ?",
        [botId],
        (err, row) => {
          if (err) return reject(err);

          if (row) {
            // Update existing record
            this.db.run(
              `UPDATE bot_config SET ${key} = ?, updatedAt = CURRENT_TIMESTAMP WHERE botId = ?`,
              [value, botId],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          } else {
            // Insert new record
            const data = {botId, [key]: value};
            this.db.run(
              "INSERT INTO bot_config (botId, userId, assistantId) VALUES (?, ?, ?)",
              [botId, data.userId || null, data.assistantId || null],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          }
        }
      );
    });
  }

  async getBotConfig(botId, key) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT ${key} FROM bot_config WHERE botId = ?`,
        [botId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row ? row[key] : null);
        }
      );
    });
  }

  async deleteBotConfig(botId) {
    return new Promise((resolve, reject) => {
      this.db.run("DELETE FROM bot_config WHERE botId = ?", [botId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

// Singleton instance
const db = new SQLiteDB();
module.exports = db;
