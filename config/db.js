import mysql from 'mysql';

const dbConfig = {
  // host: "localhost",
  // user: "root",
  // password: "password",
  // database: "qpaper"

  // host: "www.epaper.pixalogy.lk",
  // user: "pixalogy_epaper",
  // password: "h9TZr4M6v-",
  // database: "pixalogy_epaper"
  
  host: "qpaperdb.ch6ywumwg06s.us-east-1.rds.amazonaws.com",
  user: "admin",
  password: "Password",
  database: "qpaperDB"
};
// Create a connection pool
const pool = mysql.createPool(dbConfig);

// method for execute query
const query = async (text, params) => {
  try {
    const result = await new Promise((resolve, reject) => {
      pool.query(text, params, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
    return result;
  } catch (error) {
    console.error(`Error executing query: ${error.message}`);
    throw error;
  }
};

// method for start the connection
const connectDB = async () => {
  try {
    const connection = await new Promise((resolve, reject) => {
      pool.getConnection((error, connection) => {
        if (error) {
          reject(error);
        } else {
          resolve(connection);
        }
      });
    });
    console.log('MySQL Connected');
    connection.release(); // Release the connection after obtaining it
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Export the pool for use in other modules
export { query, connectDB };