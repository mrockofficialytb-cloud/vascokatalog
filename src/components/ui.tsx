import Link from "next/link";

export function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-5xl px-4 py-10">{children}</div>;
}

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-sm">
      {children}
    </div>
  );
}

export function H1({ children }: { children: React.ReactNode }) {
  return <h1 className="text-2xl font-semibold tracking-tight">{children}</h1>;
}

export function Muted({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-zinc-400">{children}</p>;
}

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", ...rest } = props;
  return (
    <button
      className={
        "inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60 " +
        className
      }
      {...rest}
    />
  );
}

export function GhostButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", ...rest } = props;
  return (
    <button
      className={
        "inline-flex items-center justify-center rounded-xl border border-zinc-800 bg-transparent px-4 py-2 text-sm font-semibold text-zinc-100 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-60 " +
        className
      }
      {...rest}
    />
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return (
    <input
      className={
        "w-full rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 " +
        className
      }
      {...rest}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = "", ...rest } = props;
  return (
    <select
      className={
        "w-full rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 " +
        className
      }
      {...rest}
    />
  );
}

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-sm font-semibold text-zinc-200 hover:text-white">
      {children}
    </Link>
  );
}

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-950/40 px-2.5 py-1 text-xs font-semibold text-zinc-200">
      {children}
    </span>
  );
}