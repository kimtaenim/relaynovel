export function BrassPlaque({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="relative mx-auto mb-5 w-fit max-w-full sm:mb-8">
      <div className="brass-plaque relative rounded-md px-5 py-3 font-display sm:px-10 sm:py-5">
        <Screw className="absolute left-1.5 top-1.5 sm:left-2 sm:top-2" />
        <Screw className="absolute right-1.5 top-1.5 sm:right-2 sm:top-2" />
        <Screw className="absolute left-1.5 bottom-1.5 sm:left-2 sm:bottom-2" />
        <Screw className="absolute right-1.5 bottom-1.5 sm:right-2 sm:bottom-2" />
        <h1 className="text-center text-lg font-bold tracking-widest text-shadow-emboss sm:text-2xl md:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 text-center font-script text-xs italic text-mahogany sm:mt-1 sm:text-sm md:text-base">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

function Screw({ className = "" }: { className?: string }) {
  return (
    <span
      className={`screw block h-2 w-2 rounded-full shadow-inner ${className}`}
      aria-hidden
    />
  );
}
