export default function Button({ info, type = "button", onClick, disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="mt-2 mb-4 h-11 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50"
    >
      {info}
    </button>
  );
}
