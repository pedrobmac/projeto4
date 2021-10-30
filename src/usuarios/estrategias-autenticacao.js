const passport = require("passport")
const localStrategy = require("passport-local").Strategy
const BearerStrategy = require("passport-http-bearer").Strategy
const Usuario = require("./usuarios-modelo")
const { InvalidArgumentError } = require("../erros")
const { ExpirationError } = require("../erros")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

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

function verificaExpiracao(tempoExpiracao) {
    const agora = Date.now()
    if (tempoExpiracao < agora) {
      throw new ExpirationError('Sessão expirada, refaça o login');
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
                const payload = jwt.verify(token, process.env.CHAVE_JWT)
                verificaExpiracao(payload.expiraEm)
                const usuario = await Usuario.buscaPorId(payload.id)
                done(null, usuario)
            } catch (erro) {
                done(erro)
            }
        }
    )
)