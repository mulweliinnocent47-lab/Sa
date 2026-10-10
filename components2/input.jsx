export default function Input({ id, type = "text", pro, value, logic, must }) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">{pro}</label>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={value}
        onChange={logic}
        required={must}
        autoComplete={
          type === "password"
            ? id === "confirm" ? "new-password" : "current-password"
            : type === "email" ? "email" : "username"
        }
        className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
      />
    </div>
  );
}
