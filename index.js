import express from "express";
import {connectDB} from "./config/db.js";
import questionRoutes from './routes/questionRoutes.js';
import paperRoute from './routes/paperRoute.js';
import cors from 'cors';
const port = 5000


// Create Express app

const app = express()
app.use(cors());
// Parse JSON bodies
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use('/api/question', questionRoutes);
app.use('/api/paper', paperRoute);

app
  .listen(port, () => {
    console.log(`Backend started on port ${port}`)
    connectDB();
  })
  .on('error', (err) => {
    console.error(`Backend error: ${err}`)
  })









// app.use(bodyParser.json());

// app.get("/get", (req, res) => {
//     // Execute the query
//     pool.query("SELECT DISTINCT subject FROM questions ORDER BY subject", (err, result) => {
//         if (err) {
//             // Handle error
//             console.error("Error executing query:", err);
//             res.status(500).json({ error: "Internal server error" });
//             return;
//         }
//         // Send the query result as JSON
//         res.json(result);
//     });
// });

// app.post("/add", (req, res) => {
//     // Extract data from the request body (assuming it's JSON)
//     const { instruction_id, instruction_text } = req.body;

//     // Execute the query
//     pool.query(
//         "INSERT INTO instruction (instruction_id, instruction_text) VALUES (?, ?)",
//         [instruction_id, instruction_text],
//         async (err, result) => {
//             if (err) {
//                 // Handle error
//                 console.error("Error executing query:", err);
//                 return res.status(500).json({ error: "Internal server error" });
//             }
//             // Send success response
//             res.json({ message: "Added successfully", affectedRows: result.affectedRows });
//         }
//     );
// });

