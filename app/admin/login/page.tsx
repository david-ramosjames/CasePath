import { login } from "@/app/admin/login/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message =
    error === "setup"
      ? "Set CASEPATH_ADMIN_PASSWORD before signing in."
      : error
        ? "That password is not correct."
        : null;

  return (
    <main className="sheet admin">
      <p className="firm-name" style={{ color: "#02234d" }}>
        Ramos James Law
      </p>
      <h1>CasePath editor</h1>
      <p>Sign in to edit stages, wording, and videos in English and Spanish.</p>
      {message ? <p className="form-error">{message}</p> : null}
      <form action={login} className="stack">
        <label>
          Password
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        <button className="contact" type="submit">
          Sign in
        </button>
      </form>
    </main>
  );
}
