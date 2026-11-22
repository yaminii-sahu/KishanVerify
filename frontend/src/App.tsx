import React from 'react'

export default function App() {
  return (
    <div className="min-h-screen bg-warm-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-card border border-warm-border text-center">
        <div className="w-16 h-16 bg-sage-100 text-sage-600 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
          KV
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">KisanVerify</h1>
        <p className="text-sm text-gray-600 mb-6">Every rupee. Every benefit. Verified.</p>
        <span className="inline-block px-3 py-1 bg-sage-50 text-sage-700 text-xs font-semibold rounded-full border border-sage-200">
          Scaffolding Ready
        </span>
      </div>
    </div>
  )
}
