/** Stepper horizontal del wizard de reserva. Mobile-first con scroll. */
export default function Stepper({ pasos, actual }: { pasos: string[]; actual: number }) {
  return (
    <ol className="mb-6 flex gap-2 overflow-x-auto pb-1">
      {pasos.map((paso, i) => {
        const hecho = i < actual;
        const activo = i === actual;
        return (
          <li key={paso} className="flex items-center gap-2 whitespace-nowrap">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                hecho
                  ? 'bg-green-600 text-white'
                  : activo
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-500'
              }`}
            >
              {hecho ? '✓' : i + 1}
            </span>
            <span
              className={`text-xs font-medium sm:text-sm ${
                activo ? 'text-slate-900' : 'text-slate-400'
              }`}
            >
              {paso}
            </span>
            {i < pasos.length - 1 && <span aria-hidden className="text-slate-300">→</span>}
          </li>
        );
      })}
    </ol>
  );
}
