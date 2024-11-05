import { AppLayout, AppLayoutProps, Flashbar } from "@cloudscape-design/components";
import { useNavigationPanelState } from "../common/hooks/use-navigation-panel-state";
import NavigationPanel from "./navigation-panel";
import { ReactElement, useState } from "react";
import { useParams } from "react-router-dom";
import { SessionRefreshContext } from "../common/session-refresh-context"
import { NotificationProvider } from "./notif-manager";
import NotificationBar from "./notif-flashbar"

export default function BaseAppLayout(
  props: AppLayoutProps & { info?: ReactElement; documentIdentifier?: string }
) {
  const [navigationPanelState, setNavigationPanelState] =
    useNavigationPanelState();
  const [toolsOpen, setToolsOpen] = useState(false);  
  const [needsRefresh, setNeedsRefresh] = useState(true);
  const { documentIdentifier } = useParams();
  console.log("BASE APP IDENTIFIER: ", documentIdentifier)
  console.log("BASE APP IDENTIFIER (from props): ", props.documentIdentifier)
  //console.log("Is identifier in here", props)

  return (
    <SessionRefreshContext.Provider value={{ needsRefresh, setNeedsRefresh }}>
      <NotificationProvider>
        <AppLayout
          headerSelector="#awsui-top-navigation"
          navigation={<NavigationPanel documentIdentifier={props.documentIdentifier}/>}
          navigationOpen={!navigationPanelState.collapsed}
          onNavigationChange={({ detail }) =>
            setNavigationPanelState({ collapsed: !detail.open })
          }
          toolsHide={props.info === undefined ? true : false}
          tools={props.info}
          toolsOpen={toolsOpen}
          stickyNotifications={true}
          notifications={<NotificationBar />}
          onToolsChange={({ detail }) => setToolsOpen(detail.open)}
          {...props}
        />
      </NotificationProvider>
    </SessionRefreshContext.Provider>
  );
}
