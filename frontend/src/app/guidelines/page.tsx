export default function GuidelinesPage() {
  return (
    <div className="shell-card-strong space-y-5 p-6 md:p-8">
      <p className="eyebrow">Community guidelines</p>
      <h1 className="section-title">Professional, clear, and useful.</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {[
          "Be respectful and constructive.",
          "No doxxing, harassment, or hate speech.",
          "No solicitation spam, growth hacks, or irrelevant ads.",
          "Share what worked, what failed, and what you learned.",
        ].map((item) => (
          <div key={item} className="rounded-[24px] border border-slate-200/70 bg-white/80 p-5 text-sm leading-6 text-slate-700">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
