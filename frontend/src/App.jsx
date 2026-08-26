import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-2xl mb-4 border border-emerald-500/20">
          🌾
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
          KrishiSetu
        </h1>
        <p className="text-slate-400 text-sm mb-6">
          Direct Farmer-to-Trader Marketplace & Mandi Intelligence
        </p>

        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50 mb-6">
          <p className="text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-1">
            Tailwind CSS Verified
          </p>
          <p className="text-slate-300 text-sm">
            React 19 + Tailwind v3 configured cleanly.
          </p>
        </div>

        <button
          onClick={() => setCount((c) => c + 1)}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl shadow-lg transition-all duration-200 active:scale-[0.98] cursor-pointer"
        >
          Interactive Counter: <span className="font-bold">{count}</span>
        </button>
      </div>
    </div>
  )
}

export default App
