import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacidad · EIDOS",
  description:
    "Cómo EIDOS maneja tus datos: qué recopilamos, para qué y cómo borrar tu cuenta.",
};

const CONTACT_EMAIL = "hola@playeidos.com";

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-bg-base px-5 py-10 text-text-primary md:px-8 md:py-14">
      <article className="mx-auto w-full max-w-xl space-y-6">
        <header className="border-b border-accent-cyan/20 pb-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-accent-cyan">
            Privacidad
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            Cómo manejamos tus datos
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Última actualización: abril 2026
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-accent-gold">
            Qué recopilamos
          </h2>
          <p className="text-sm leading-relaxed text-text-primary">
            Al usar EIDOS guardamos tu nombre de héroe, tu email, las respuestas
            que das durante el onboarding, lo que escribes en el journal, los
            hábitos que activas, los eventos de tu agenda y los check-ins
            diarios. Nada más.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-accent-gold">
            Para qué los usamos
          </h2>
          <p className="text-sm leading-relaxed text-text-primary">
            Los usamos solo para personalizar tu experiencia: armar tu mapa de
            áreas, sugerirte misiones, calcular tu racha, mostrar tu progreso y
            ayudarte a construir tu ruta crítica. Si en algún momento usamos tus
            datos para entrenar modelos o mejorar el producto, será siempre de
            forma agregada y anonimizada — nunca atado a tu identidad.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-accent-gold">
            Qué no hacemos
          </h2>
          <p className="text-sm leading-relaxed text-text-primary">
            No vendemos tus datos. No los compartimos con terceros con fines
            comerciales. No se los pasamos a anunciantes. Tu journal, tus
            respuestas y lo que escribes son tuyos.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-accent-gold">
            Eliminar tu cuenta
          </h2>
          <p className="text-sm leading-relaxed text-text-primary">
            Si quieres borrar todo lo que tenemos sobre ti, escríbenos a{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-medium text-accent-cyan underline hover:brightness-110"
            >
              {CONTACT_EMAIL}
            </a>{" "}
            desde el correo con el que te registraste. Borramos tu cuenta y todo
            lo asociado en menos de 7 días.
          </p>
          <p className="text-sm leading-relaxed text-text-muted">
            También puedes hacer un &quot;Full reset&quot; desde tu perfil para
            borrar tu progreso conservando la cuenta.
          </p>
        </section>

        <footer className="border-t border-accent-cyan/20 pt-5">
          <Link
            href="/"
            className="text-xs text-accent-cyan underline hover:brightness-110"
          >
            ← Volver al inicio
          </Link>
        </footer>
      </article>
    </main>
  );
}
