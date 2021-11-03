const controle = require("../controleDeAcesso")

const metodos = {
    ler: {
        todos: "readAny",
        apenasSeu: "readOwn"
    },
    criar: {
        todos: "createAny",
        apenasSeu: "createOwn"
    },
    remover: {
        todos: "deleteAny",
        apenasSeu: "deleteOwn"
    }
}

module.exports = (entidade, acao) => (requisicao, resposta, proximo) => {
    const permissoesDoCargo = controle.can(requisicao.user.cargo)
    const acoes = metodos[acao]
    const permissaoTodos = permissoesDoCargo[acoes.todos](entidade)
    const permissaoApensasSeu = permissoesDoCargo[acoes.apenasSeu](entidade)

    if (permissaoTodos.granted === false && permissaoApensasSeu.granted === false) {
        resposta.status(403)
        resposta.end()
        return
    }

    requisicao.acesso = {
        todos: {
            permitido: permissaoTodos.granted,
            atributos: permissaoTodos.attributes
        },
        apenasSeu: {
            permitido: permissaoApensasSeu.granted,
            atributos: permissaoApensasSeu.attributes
        },
    }

    proximo()
}