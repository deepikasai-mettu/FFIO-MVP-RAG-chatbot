import { AppLayout } from "@cloudscape-design/components";
import { ReactElement, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SessionRefreshContext } from "../common/session-refresh-context";
import { NotificationProvider } from "./notif-manager";
import NotificationBar from "./notif-flashbar";
import NavigationPanel from "./navigation-panel";

interface BaseAppLayoutProps {
  content: ReactElement;
  info?: ReactElement;
  documentIdentifier?: string;
  contentType?: "default" | "cards" | "table" | "form";
  breadcrumbs?: ReactElement;
  splitPanel?: ReactElement;
  toolsWidth?: number;
}

export default function BaseAppLayout({ content, info, documentIdentifier, contentType, breadcrumbs, splitPanel, toolsWidth }: BaseAppLayoutProps) {
  const [toolsOpen, setToolsOpen] = useState(false);
  const [needsRefresh, setNeedsRefresh] = useState(true);
  const [searchParams] = useSearchParams();
  const folderParam = searchParams.get("folder");

  console.log("BaseAppLayout - documentIdentifier:", documentIdentifier);
  console.log("BaseAppLayout - folderParam:", folderParam);

  return (
    <SessionRefreshContext.Provider value={{ needsRefresh, setNeedsRefresh }}>
      <NotificationProvider>
        <div style={{ display: 'flex', height: '100vh' }}>
          {/* Static left panel */}
          <div style={{ 
            width: '300px', 
            backgroundColor: '#f4f4f4', 
            borderRight: '1px solid #eaeded',
            overflow: 'auto'
          }}>
            <NavigationPanel documentIdentifier={documentIdentifier || folderParam} />
          </div>

          {/* Main content and tools area using AppLayout */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <AppLayout
              headerSelector="#awsui-top-navigation"
              content={
                <>
                  <NotificationBar />
                  {content}
                </>
              }
              toolsHide={!info}
              tools={info}
              toolsOpen={toolsOpen}
              onToolsChange={({ detail }) => setToolsOpen(detail.open)}
              contentType={contentType}
              navigationHide={true}
              toolsWidth={toolsWidth}
            />
          </div>
        </div>
      </NotificationProvider>
    </SessionRefreshContext.Provider>
  );
}
