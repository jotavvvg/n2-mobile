export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function validateRegistration({ nome, email, senha }) {
  if (!nome.trim() || !email.trim() || !senha.trim()) return 'Preencha seu nome, e-mail e senha.';
  if (!isValidEmail(email)) return 'Informe um e-mail válido.';
  return '';
}

export function validateLogin({ email, senha }) {
  if (!email.trim() || !senha) return 'Informe seu e-mail e senha.';
  if (!isValidEmail(email)) return 'Informe um e-mail válido.';
  return '';
}

export function validateAddress(value) {
  const address = value.trim();
  if (!address) return 'Informe o endereço de entrega.';
  if (address.length < 8) return 'Informe um endereço de entrega mais completo.';
  return '';
}
