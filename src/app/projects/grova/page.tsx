import ProjectPage from "@/components/ProjectPage";
import { PROJECTS } from "@/lib/projects";

export default function GrovaPage() {
  const project = PROJECTS.find((p) => p.slug === "grova")!;
  return <ProjectPage project={project} />;
}
