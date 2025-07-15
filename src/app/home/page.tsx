export default function Home() {
  return (
    <section className="relative h-[90vh] flex items-center justify-center text-center px-4 bg-gradient-to-br from-sky-100 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="absolute inset-0 bg-[url('/piura.jpg')] bg-cover bg-center opacity-20 dark:opacity-10"></div>

      <div className="relative z-10 max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-extrabold text-sky-700 dark:text-cyan-300 animate-fadeInUp">
          Bienvenido a{" "}
          <span className="text-cyan-500 dark:text-white">Descubre Piura</span>
        </h1>
        <p className="mt-4 text-lg text-sky-800 dark:text-slate-300 animate-fadeInUp">
          Explora los destinos, eventos y experiencias únicas del norte del
          Perú.
        </p>
        <div className="mt-6 animate-fadeInUp">
          <a
            href="/planner"
            className="inline-block bg-cyan-500 text-white px-6 py-3 rounded-full font-medium hover:bg-cyan-600 transition shadow hover:drop-shadow-glow"
          >
            Comienza tu viaje
          </a>
        </div>
      </div>
    </section>
  );
}
