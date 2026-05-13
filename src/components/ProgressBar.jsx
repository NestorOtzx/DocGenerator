export default function ProgressBar({ steps, currentStep }) {
  return (
    <div className="mt-4 rounded-xl border border-violet-100 bg-violet-50 p-4">
      <p className="text-sm font-semibold text-violet-700 mb-3">
        Generating documentation...
      </p>
      <ol className="space-y-2">
        {steps.map((step, index) => {
          const isDone = index < currentStep;
          const isActive = index === currentStep;
          return (
            <li key={step} className="flex items-center gap-3 text-sm">
              <span
                className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-violet-600 text-white' : 'bg-gray-200 text-gray-500'}`}
              >
                {isDone ? 'OK' : index + 1}
              </span>
              <span
                className={
                  isDone
                    ? 'text-emerald-700 line-through opacity-70'
                    : isActive
                      ? 'text-violet-800 font-medium'
                      : 'text-gray-400'
                }
              >
                {step}
              </span>
              {isActive && (
                <svg className="w-4 h-4 animate-spin text-violet-600 ml-auto"
                  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx={12} cy={12} r={10}
                    stroke="currentColor" strokeWidth={4} />
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
