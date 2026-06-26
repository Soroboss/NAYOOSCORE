type PageHeaderProps = {
  title: string;
  description?: string;
  badge?: string;
};

export function PageHeader({ title, description, badge }: PageHeaderProps) {
  return (
    <div className="space-y-1">
      {badge && (
        <p className="text-xs font-semibold uppercase tracking-widest text-[#00BFA6]">
          {badge}
        </p>
      )}
      <h1 className="text-2xl font-bold text-[#0B1D2A]">{title}</h1>
      {description && (
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
