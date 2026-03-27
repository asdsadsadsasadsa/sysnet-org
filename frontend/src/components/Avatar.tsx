type AvatarProps = {
  url?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-10 w-10 text-xs",
  lg: "h-20 w-20 text-xl",
};

export function Avatar({ url, name, size = "sm" }: AvatarProps) {
  const cls = sizeClasses[size];
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={name}
        className={`shrink-0 rounded-full object-cover ${cls}`}
      />
    );
  }
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 ${cls}`}
    >
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}
