type SectionHeadingProps = {
  subtitle: string;
  title: string;
};

export function SectionHeading({ subtitle, title }: SectionHeadingProps) {
  return (
    <div className="mb-5 text-center">
      <p className="text-[13px] text-[#9a9590]">{subtitle}</p>
      <h2 className="mt-1 font-serif text-[2rem] font-normal tracking-[0.08em] text-[#5a5a5a]">
        {title}
      </h2>
    </div>
  );
}
