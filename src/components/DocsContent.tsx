"use client"

import { cn } from "@/lib/utils"

type DocsContentProps = {
  condensed?: boolean
  className?: string
}

const sections = [
  {
    title: "Incident Triage",
    points: [
      "Confirm the incident severity and affected agents before taking action.",
      "Assign an on-call owner and capture investigation notes in the report.",
      "Update the incident status as the investigation progresses so the dashboard stays current.",
    ],
  },
  {
    title: "Workflow Checklist",
    points: [
      "Gather context: review related alerts, recent deployments, and prior incidents.",
      "Mitigate impact: communicate with stakeholders and apply temporary safeguards if needed.",
      "Document learnings: capture remediation steps and post-mortem tasks before closing.",
    ],
  },
  {
    title: "Data You Should Capture",
    points: [
      "Root cause hypothesis and supporting metrics.",
      "Teams or systems impacted and expected blast radius.",
      "Follow-up actions with clear owners and due dates.",
    ],
  },
]

export function DocsContent({
  condensed = false,
  className,
}: DocsContentProps) {
  return (
    <div
      className={cn(
        "space-y-6 text-sm leading-relaxed text-muted-foreground",
        condensed && "space-y-4 text-xs",
        className
      )}
    >
      {sections.map((section) => (
        <section key={section.title} className="space-y-2">
          <h3
            className={cn(
              "font-semibold text-foreground",
              condensed && "text-sm"
            )}
          >
            {section.title}
          </h3>
          <ul className="space-y-1.5">
            {section.points.map((point) => (
              <li key={point} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/60" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
