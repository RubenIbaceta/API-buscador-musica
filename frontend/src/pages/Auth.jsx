import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../services/api';

export default function Auth({ register = false, notify }) {
  const { user, authenticate, ready, mode } = useAuth();
  const [params] = useSearchParams();
  const destination = params.get('next');
  const next = destination && /^\/(?!\/)/.test(destination) && !destination.startsWith('/ingresar') && !destination.startsWith('/registro') ? destination : '/coleccion';
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [dirty, setDirty] = useState(false);
  const form = useRef(null);
  const navigate = useNavigate();
  useEffect(() => { if (Object.keys(errors).length) form.current?.elements.namedItem(Object.keys(errors)[0])?.focus(); }, [errors]);
  useEffect(() => {
    if (!dirty) return;
    const preventLoss = event => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', preventLoss); return () => window.removeEventListener('beforeunload', preventLoss);
  }, [dirty]);
  async function submit(event) {
    event.preventDefault(); setErrors({}); setMessage('');
    const values = Object.fromEntries(new FormData(event.currentTarget));
    values.email = values.email.trim();
    if (register) values.username = values.username.trim();
    const fields = {};
    if (register && (values.username.length < 2 || values.username.length > 50)) fields.username = 'Usa entre 2 y 50 caracteres.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) fields.email = 'Escribe un correo válido, como nombre@correo.com.';
    if (!values.password || (register && values.password.length < 8)) fields.password = register ? 'Usa al menos 8 caracteres para tu contraseña.' : 'Escribe tu contraseña.';
    if (Object.keys(fields).length) { setErrors(fields); return; }
    setBusy(true);
    try {
      await authenticate(register ? 'register' : 'login', values); setDirty(false);
      notify(register ? 'Tu cuenta está lista. Empieza tu colección.' : 'Qué bueno que volviste.');
      navigate(next, { replace: true });
    } catch (error) { setMessage(errorMessage(error)); setErrors(error.response?.data?.fields || {}); }
    finally { setBusy(false); }
  }
  if (ready && user) return <Navigate to={next} replace />;
  const otherPath = `${register ? '/ingresar' : '/registro'}?next=${encodeURIComponent(next)}`;
  return <div className="auth-page shell">
    <div className="auth-story"><nav aria-label="Volver al buscador"><Link className="back-link" to="/"><ArrowLeft size={17} aria-hidden="true" />Volver a explorar</Link></nav><h1>{register ? <>Tu música.<br />Tu lugar.</> : <>Vuelve a<br />tu música.</>}</h1><p>{register ? 'Hay canciones que merecen quedarse. Reúne las tuyas en una colección que se sienta como tú.' : 'Tus canciones favoritas te están esperando. Entra y sigue donde te quedaste.'}</p><div className="auth-artwork" aria-hidden="true"><img src="/images/space-song.jpg" width="240" height="240" alt="" /><img src="/images/holocene.jpg" width="240" height="240" alt="" /><img src="/images/about-you.jpg" width="240" height="240" alt="" /></div></div>
    <div className="auth-form-area"><h2>{register ? 'Crea tu cuenta' : 'Inicia sesión'}</h2><p>{register ? 'Un correo, una contraseña y tus próximas favoritas.' : 'Qué bueno volver a encontrarte.'}</p>
      <form ref={form} noValidate onSubmit={submit} onChange={() => setDirty(true)}>
        {register && <div className="form-field"><label htmlFor="username">Tu nombre</label><input id="username" name="username" autoComplete="nickname" spellCheck={false} maxLength={50} required placeholder="Cómo te llamas…" aria-invalid={Boolean(errors.username)} aria-describedby={errors.username ? 'username-error' : undefined} />{errors.username && <p id="username-error" className="field-error">{errors.username}</p>}</div>}
        <div className="form-field"><label htmlFor="email">Correo electrónico</label><input id="email" name="email" type="email" autoComplete="email" spellCheck={false} inputMode="email" maxLength={100} required placeholder="nombre@correo.com…" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} />{errors.email && <p id="email-error" className="field-error">{errors.email}</p>}</div>
        <div className="form-field"><label htmlFor="password">Contraseña</label><div className="password-field"><input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete={register ? 'new-password' : 'current-password'} minLength={register ? 8 : undefined} maxLength={72} required placeholder={register ? 'Al menos 8 caracteres…' : 'Tu contraseña…'} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'password-error' : register ? 'password-help' : undefined} /><button className="icon-button" type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={showPassword}>{showPassword ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}</button></div>{errors.password ? <p className="field-error" id="password-error">{errors.password}</p> : register && <p className="field-help" id="password-help">Usa al menos 8 caracteres.</p>}</div>
        <div className="form-message" role="alert">{message}</div>
        <button className="button auth-submit" disabled={busy} type="submit">{busy && <LoaderCircle size={18} className="spinner" aria-hidden="true" />}{busy ? (register ? 'Creando tu cuenta…' : 'Iniciando sesión…') : register ? 'Crear cuenta' : 'Iniciar sesión'}</button>
      </form>
      <p className="auth-switch">{register ? '¿Ya tienes cuenta?' : '¿Todavía no tienes cuenta?'} <Link to={otherPath}>{register ? 'Inicia sesión' : 'Crea una cuenta'}</Link></p>
      {mode === 'demo' && <p className="auth-demo-note">Esta es una muestra local. Usa datos de prueba: las cuentas se borran al reiniciar el servidor.</p>}
    </div>
  </div>;
}
