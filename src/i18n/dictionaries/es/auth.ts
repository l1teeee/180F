// Owned by: auth screens (src/components/auth/**, src/app/(auth)/login/page.tsx).
// Spanish is the shape's source of truth - en/auth.ts is checked against this file's key set
// with `satisfies Messages` (src/i18n/dictionaries/en/index.ts).
//
// Zod validation note (login-form.tsx): loginSchema is defined inside the component and its
// English messages are never rendered - CustomerStep's schema lives in domain/schemas (not
// owned by this namespace, and a module-scope schema can't call useMessages() anyway), so both
// forms map field identity to translated copy at render instead of translating a schema
// message string. Each field here has exactly one possible validation failure, so the field
// name alone determines which key to show.
export const auth = {
  heading: 'Bienvenido de nuevo',
  subtitle: 'Gestiona tus clases, clientes y reservas desde un solo lugar.',
  emailLabel: 'Correo electrónico',
  emailPlaceholder: 'admin@demo.com',
  passwordLabel: 'Contraseña',
  passwordPlaceholder: 'demo1234',
  rememberMe: 'Recordarme',
  forgotPassword: '¿Olvidaste tu contraseña?',
  forgotPasswordToast: 'El restablecimiento de contraseña no está disponible en esta demo.',
  signIn: 'Iniciar sesión',
  genericError: 'Algo salió mal. Inténtalo de nuevo.',
  demoCredentialsLabel: 'Credenciales de la demo:',
  errors: {
    emailInvalid: 'Introduce un correo electrónico válido',
    passwordRequired: 'Introduce tu contraseña',
    invalidCredentials: 'Correo electrónico o contraseña incorrectos.',
  },
};
