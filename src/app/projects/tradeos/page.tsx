import ProjectPage from "@/components/ProjectPage";
import { PROJECTS } from "@/lib/projects";

export default function TradeOSPage() {
  const project = PROJECTS.find((p) => p.slug === "tradeos")!;
  return <ProjectPage project={project} />;
}
