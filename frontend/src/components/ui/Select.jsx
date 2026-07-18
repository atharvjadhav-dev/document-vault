import React, { useId } from 'react';

const Select = React.forwardRef(({
  label,
  id,
  name,
  error,
  options = [],
  placeholder,
  className = '',
  ...props
}, ref) => {
  const generatedId = useId();
  const selectId = id || generatedId;
  const selectName = name || generatedId;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="label">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        name={selectName}
        className={`input ${error ? 'input-error' : ''} ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value || opt} value={opt.value || opt}>
            {opt.label || opt}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
