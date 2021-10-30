const passport = require("passport")
const localStrategy = require("passport-local").Strategy
const BearerStrategy = require("passport-http-bearer").Strategy
const Usuario = require("./usuarios-modelo")
const { InvalidArgumentError } = require("../erros")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const denylist = require("../../redis/manipula-deny-list")

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

async function verificaTokenNaDenylist(token){
    const tokenNaDenyList = await denylist.contemToken(token)
    if(tokenNaDenyList){
        throw new jwt.JsonWebTokenError("Sessão expirada por logout")
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

passport.use(
    new BearerStrategy(
        async (token, done) => {
            try {
                await verificaTokenNaDenylist(token)
                const payload = jwt.verify(token, process.env.CHAVE_JWT)
                const usuario = await Usuario.buscaPorId(payload.id)
                done(null, usuario, { token: token })
            } catch (erro) {
                done(erro)
            }
        }
    )
)