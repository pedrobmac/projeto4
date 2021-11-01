const denylist = require("./deny-list")
const jwt = require("jsonwebtoken")
const { createHash } = require("crypto")

const { promisify } = require("util") //para adaptar uma função síncrona para assíncrona
const existsAsync = promisify(denylist.exists).bind(denylist)
const setAsync = promisify(denylist.set).bind(denylist)

function geraTokenHash(token) {
    return createHash("sha256")
        .update(token)
        .digest("hex")
}

module.exports = {
    async adiciona(token) {
      const dataExpiracao = jwt.decode(token).exp;
      const tokenHash = geraTokenHash(token);
      await setAsync(tokenHash, '');
      await denylist.expireat(tokenHash, dataExpiracao);
    },
    async contemToken(token) {
      const tokenHash = geraTokenHash(token);
      const resultado = await existsAsync(tokenHash);
      return resultado === 1;
    },
  };