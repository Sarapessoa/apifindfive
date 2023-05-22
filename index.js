import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from './routes/authRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';

dotenv.config();

const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;

const app = express();
app.use(express.json());
app.use(cors({
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
  }));

app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({msg: "Rota pública"});
})
app.use('/auth', authRoutes);
app.use('/usuario', usuarioRoutes);

app.listen(3000);

mongoose.connect(
    `mongodb+srv://${dbUser}:${dbPass}@cluster0.whxr4yj.mongodb.net/?retryWrites=true&w=majority`
)
.then(() => {
    console.log("Servidor Iniciado e Conectado ao Banco")
}).catch((error) => console.log(error))