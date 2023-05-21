import mongoose from "mongoose";

const Usuario = mongoose.model('Usuario', {
    nome: String,
    email: String,
    senha: String
})

export default Usuario;