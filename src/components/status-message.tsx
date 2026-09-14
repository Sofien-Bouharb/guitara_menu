export function StatusMessage({
  error,
  success,
}: {
  error?: string | null;
  success?: string | null;
}) {
  if (error) {
    return <div className="error">{error}</div>;
  }

  if (success) {
    return <div className="notice">{success}</div>;
  }

  return null;
}
