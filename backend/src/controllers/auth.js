export function authController(auth, production) {
  const cookieOptions = { httpOnly: true, secure: production, sameSite: 'lax', path: '/api', maxAge: 2 * 60 * 60 * 1000 };
  const respond = (res, result, status = 200) => res.status(status).cookie('savia_session', result.token, cookieOptions).json({ user: result.user });
  return {
    register: async (req, res) => respond(res, await auth.register(req.validated), 201),
    login: async (req, res) => respond(res, await auth.login(req.validated)),
    logout: (req, res) => res.clearCookie('savia_session', { ...cookieOptions, maxAge: undefined }).status(204).end(),
    me: (req, res) => res.json({ user: req.user })
  };
}
