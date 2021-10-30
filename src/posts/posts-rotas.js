const postsControlador = require('./posts-controlador');
const passport = require("passport")

module.exports = app => {

  app.use(passport.initialize())

  app
    .route('/post')
    .get(postsControlador.lista)
    .post(
      passport.authenticate("bearer", { session: false }),
      postsControlador.adiciona
    )
}
