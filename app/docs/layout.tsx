import { DocsLayout } from "fumadocs-ui/layouts/docs";

import { source } from "@/lib/source";
import { baseOptions } from "@/lib/layout.shared";

type DocsLayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: DocsLayoutProps) {
  return (
    <DocsLayout tree={source.getPageTree()} {...baseOptions()}>
      {children}
    </DocsLayout>
  );
}