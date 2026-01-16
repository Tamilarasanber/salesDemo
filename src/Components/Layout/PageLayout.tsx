// Page Layout component (placeholder for future use)
import { ReactNode } from "react";
import Header from "./Header";

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  headerActions?: ReactNode;
}

const PageLayout = ({
  children,
  title,
  subtitle,
  headerActions,
}: PageLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header title={title} subtitle={subtitle} actions={headerActions} />
      <main className="w-full max-w-[1600px] mx-auto px-6 py-6">
        {children}
      </main>
    </div>
  );
};

export default PageLayout;
