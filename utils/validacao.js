
export const validacao = (campo, mensagem) => {
    if (!campo) throw new Error(mensagem); 
}