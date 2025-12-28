import React from "react"

const Input = React.forwardRef(
  ({ label, error, type = "text", className = "", containerClassName = "", ...props }, ref) => {
    return (
      <div className={`flex flex-col ${containerClassName}`}>
        {label && (
          <label className="mb-2 text-sm font-semibold text-slate-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={`px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white text-slate-900 placeholder-slate-400 ${
            error ? "border-red-500 focus:ring-red-500" : ""
          } ${className}`}
          {...props}
        />
        {error && <span className="mt-1.5 text-sm text-red-600 font-medium">⚠️ {error}</span>}
      </div>
    )
  },
)

Input.displayName = "Input"

export default Input