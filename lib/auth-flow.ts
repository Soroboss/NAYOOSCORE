/** Configuration auth InsForge (verifyEmailMethod: code sur ce projet). */
export const AUTH_VERIFY_EMAIL_METHOD = "code" as const;

export function getAuthRedirectUrl(path = "") {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path}`;
}

export function getSignupVerificationMessage() {
  return "Un code à 6 chiffres a été envoyé à votre adresse email. Saisissez-le ci-dessous pour activer votre compte.";
}
