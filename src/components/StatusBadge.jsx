export default function StatusBadge({ status }) {
  if (status === "live") {
    return (
      <span className="badge badge-live">
        <span className="pulse" />
        Live
      </span>
    );
  }
  if (status === "ended") {
    return <span className="badge badge-ended">Ended</span>;
  }
  return <span className="badge badge-none">No lecture</span>;
}
