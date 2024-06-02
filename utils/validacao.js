
export const validacao = (campo, mensagem) => {
    if (!campo || campo == "") throw new Error(mensagem); 
}
