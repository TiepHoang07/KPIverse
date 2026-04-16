import { useNavigate } from "react-router-dom";

type Props = {
  group: any;
};

export default function GroupHeader({ group }: Props) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between rounded-2xl bg-card px-6 py-4 sm:py-6 shadow-xl border border-border">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{group.group.name}</h1>
        <p className="text-sm font-medium text-muted-foreground/60 mt-1">{group.group.description}</p>
        <div className="mt-2 sm:mt-4 flex items-center gap-4 text-xs font-semibold uppercase tracking-widest">
          <span className={`rounded-full px-3 py-1 border ${group.membership.role === "ADMIN" ? "bg-purple-100 text-purple-700 border-purple-300" : "bg-primary/10 text-primary border-primary/20"}`}>
            {group.membership.role}
          </span>
          <span className="text-muted-foreground/40">
            {group.members?.length || 0} members collaborating
          </span>
        </div>
      </div>
 
      <button
        onClick={() => navigate(`/groups/${group.group.id}/members`)}
        className="transform cursor-pointer rounded-xl bg-primary/10 border border-border px-5 py-3 text-xs font-bold uppercase tracking-widest text-foreground transition-all hover:bg-primary/20 hover:border-primary/30"
      >
        Members
      </button>
    </div>
  );
}
