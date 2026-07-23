/* eslint-disable react/require-default-props */
interface SpaceToggleSwitchProps {
  id: string;
  label: string;
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

function SpaceToggleSwitch({
  id,
  label,
  checked,
  onChange,
  disabled = false,
}: SpaceToggleSwitchProps) {
  return (
    <label
      className={`sgf__toggle ${disabled ? 'sgf__toggle--disabled' : ''}`}
      htmlFor={id}
    >
      <span className="sgf__toggle-label">{label}</span>
      <span className="sgf__toggle-control">
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.checked)}
        />
        <span className="sgf__toggle-track" aria-hidden="true">
          <span className="sgf__toggle-thumb" />
        </span>
      </span>
    </label>
  );
}

export default SpaceToggleSwitch;
