const passport = require("passport")
const localStrategy = require("passport-local").Strategy
const Usuario = require("./usuarios-modelo")
const { InvalidArgumentError } = require("../erros")
const bcrypt = require("bcrypt")

function verificaUsuario(usuario) {
    if (!usuario) {
        throw new InvalidArgumentError("Usuário ou senha inválidos")
    }
}

async function verificaSenha(senha, senhaHash) {
    const senhaValida = await bcrypt.compare(senha, senhaHash)
    if (!senhaValida) {
        throw new InvalidArgumentError("Usuário ou senha inválidos")
    }
}

passport.use(
    new localStrategy({
        usernameField: "email",
        passwordField: "senha",
        session: false
    }, async (email, senha, done) => {
        try {
            const usuario = await Usuario.buscaPorEmail(email)
            verificaUsuario(usuario)
            await verificaSenha(senha, usuario.senhaHash)
            done(null, usuario)
        } catch (erro) {
            done(erro)
        }
    })
)