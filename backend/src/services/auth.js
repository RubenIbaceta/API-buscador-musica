import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ApiError } from '../lib/errors.js';

const publicUser = ({ id, username, email }) => ({ id, username, email });
export function authService(repository, secret) {
  const sign = user => jwt.sign({}, secret, { subject: String(user.id), expiresIn: '2h', issuer: 'savia', audience: 'savia-web', algorithm: 'HS256' });
  return {
    async register(data) {
      try {
        const user = await repository.createUser({ ...data, password: await bcrypt.hash(data.password, 12) });
        return { user: publicUser(user), token: sign(user) };
      } catch (error) {
        if (error.code === '23505') throw new ApiError(409, 'Ese correo o nombre de usuario ya está registrado. Prueba con otro o inicia sesión.');
        throw error;
      }
    },
    async login({ email, password }) {
      const user = await repository.findUserByEmail(email);
      // Dummy hash keeps unknown-account and bad-password requests comparable.
      const valid = await bcrypt.compare(password, user?.password || '$2b$12$qF1p84gPudFrA0i/OSXwfe4NkPQTXbpxL5fHnTUxbMQyAwxIMXrke');
      if (!user || !valid) throw new ApiError(401, 'El correo o la contraseña no coinciden. Revisa tus datos.');
      return { user: publicUser(user), token: sign(user) };
    },
    async authenticate(token) {
      try {
        const payload = jwt.verify(token, secret, { algorithms: ['HS256'], issuer: 'savia', audience: 'savia-web' });
        const user = await repository.findUserById(payload.sub);
        if (!user) throw new Error('Missing user');
        return publicUser(user);
      } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError' || error.message === 'Missing user' || error.name === 'NotBeforeError') throw new ApiError(401, 'Tu sesión terminó. Inicia sesión para continuar.');
        throw error;
      }
    }
  };
}
