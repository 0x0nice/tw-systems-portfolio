import ProjectPage from "@/components/ProjectPage";
import { PROJECTS } from "@/lib/projects";

export default function ZeroPage() {
  const project = PROJECTS.find((p) => p.slug === "zero")!;
  return <ProjectPage project={project} />;
}
