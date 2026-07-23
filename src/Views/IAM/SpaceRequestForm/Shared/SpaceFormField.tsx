/* eslint-disable react/require-default-props */
import { ChangeEvent } from 'react';

interface SpaceFormFieldProps {
  id: string;
  name: string;
  label: string;
  type?: 'text' | 'date';
  value: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  wide?: boolean;
  readOnly?: boolean;
}

function SpaceFormField({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  wide = false,
  readOnly = false,
}: SpaceFormFieldProps) {
  return (
    <div className={`sgf__field ${wide ? 'sgf__field--wide' : ''}`}>
      <label htmlFor={id}>
        {label}
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          readOnly={readOnly}
        />
      </label>
    </div>
  );
}

export default SpaceFormField;
