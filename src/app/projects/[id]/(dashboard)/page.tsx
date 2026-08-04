export default async function ProjectDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex items-center justify-center h-full border-2 border-dashed border-border/40 rounded-2xl bg-muted/10">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">Project Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Dashboard for project <span className="font-mono text-toxic">{id}</span>. Main content coming in a future phase.
        </p>
      </div>
    </div>
  );
}
