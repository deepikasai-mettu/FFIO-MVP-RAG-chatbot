import {
  SideNavigation,
  SideNavigationProps,
  Header,
  Button,
  Link,
  Box,
  StatusIndicator,
  SpaceBetween,
  ContentLayout,
  Container,
  Tabs,
  Alert
} from "@cloudscape-design/components";
import { useContext, useState, useEffect } from "react";
import useOnFollow from "../common/hooks/use-on-follow";
import { useNavigationPanelState } from "../common/hooks/use-navigation-panel-state";
import { useNavigate } from 'react-router-dom';
import { AppContext } from "../common/app-context";
import PencilSquareIcon from "../../public/images/pencil-square.jsx";
import RouterButton from "../components/wrappers/router-button";
import { ApiClient } from "../common/api-client/api-client";
import { Auth } from "aws-amplify";
import { v4 as uuidv4 } from "uuid";
import { SessionRefreshContext } from "../common/session-refresh-context";
import { useNotifications } from "../components/notif-manager";
import { Utils } from "../common/utils.js";
import BackArrowIcon from "../../public/images/back-arrow.jsx";
import DocumentsTab from "../pages/admin/documents-tab";
import { useParams } from "react-router-dom";
import DataFileUpload from "../pages/admin/file-upload-tab";


export default function NavigationPanel({ documentIdentifier }) {
  const appContext = useContext(AppContext);
  const apiClient = new ApiClient(appContext);
  const onFollow = useOnFollow();
  const [navigationPanelState, setNavigationPanelState] = useNavigationPanelState();
  const navigate = useNavigate();
  const [items, setItems] = useState<SideNavigationProps.Item[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);
  const { needsRefresh, setNeedsRefresh } = useContext(SessionRefreshContext);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const { addNotification, removeNotification } = useNotifications();
  const [activeHref, setActiveHref] = useState(window.location.pathname);
  const [activeTab, setActiveTab] = useState("file");
  const [lastSyncTime, setLastSyncTime] = useState("");
  const [showUnsyncedAlert, setShowUnsyncedAlert] = useState(false);
  const searchParams  = useParams();
  
  const docIdentifierParams = searchParams.documentIdentifier
  console.log("docIdentifierParams: ", docIdentifierParams);
  console.log("NAV PANEL: ", documentIdentifier);

  const docIdentifier = documentIdentifier || docIdentifierParams;
  console.log("docIdentifier: ", docIdentifier);
  const linkUrl = `/chatbot/playground/${uuidv4()}?folder=${encodeURIComponent(docIdentifier)}`

  const loadSessions = async () => {
    let username;
    try {
      await Auth.currentAuthenticatedUser().then((value) => username = value.username);
      if (username && needsRefresh) {
        const fetchedSessions = await apiClient.sessions.getSessions(username, docIdentifier);
        await updateItems(fetchedSessions);
        if (!loaded) {
          setLoaded(true);
        }
        setNeedsRefresh(false);
      }
    } catch (error) {
      console.error("Failed to load sessions:", error);
      setLoaded(true);
      addNotification("error", "Could not load sessions:".concat(error.message));
      addNotification("info", "Please refresh the page");
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [needsRefresh]);

  const onReloadClick = async () => {
    await loadSessions();
    const id = addNotification("success", "Sessions reloaded successfully!");
    Utils.delay(3000).then(() => removeNotification(id));
  };

  const updateItems = async (sessions) => {
    let newItems: SideNavigationProps.Item[] = [
      {
        type: "section",
        text: "Resources",
        items: [
          {
            type: "link",
            text: "Prompt Engineering Guide",
            href: "/images/Prompt Suggestions for Grantwell's Chatbot Users.pdf",
            external: true
          },
          { 
            type: "link", 
            text: "Provide Feedback", 
            href: "https://forms.gle/jNHk8usCSNBzhL998", 
            external: true 
          },
        ]
      },
      {
        type: "section",
        text: "Session History",
        items: sessions.map(session => ({
          type: "link",
          text: session.title,
          href: `/chatbot/playground/${session.session_id}`,
        })).concat([{
          type: "link",
          info: (
            <Box margin="xxs" textAlign="center">
              <RouterButton href={`/chatbot/sessions?folder=${encodeURIComponent(docIdentifier || '')}`} loading={loadingSessions} variant="link">View All Sessions</RouterButton>
              <Button onClick={onReloadClick} iconName="refresh" loading={loadingSessions} variant="link">Reload Sessions</Button>
            </Box>
          ),
        }]),
      }
    ];
    setItems(newItems);
  };

  const onChange = ({
    detail,
  }: {
    detail: SideNavigationProps.ChangeDetail;
  }) => {
    const sectionIndex = items.indexOf(detail.item);
    setNavigationPanelState({
      collapsedSections: {
        ...navigationPanelState.collapsedSections,
        [sectionIndex]: !detail.expanded,
      },
    });
  };

  const refreshSyncTime = async () => {
    try {
      const lastSync = await apiClient.knowledgeManagement.lastKendraSync();    
      setLastSyncTime(lastSync);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box margin="xs" padding={{ top: "l" }} textAlign="center">
        <SpaceBetween size="xl">
          <Box textAlign="right" margin={{ right: "l" }}>
            <Link href={linkUrl}>
              <h2 style={{ fontSize: '24px', display: 'inline', color: '#0073bb' }}>Chat</h2>
            </Link>
          </Box>
        </SpaceBetween>
      </Box>
      <div style={{ 
        borderBottom: '1px solid #dedee2', 
        padding: '8px 0',
        margin: '0 30px'
      }}>
        <Box />
      </div>
      
      <Box margin="xs" padding={{ top: "l" }} textAlign="center">
        <SpaceBetween size="s">
          <Box textAlign="right" margin={{ right: "l" }}>
              <h2 style={{ fontSize: '24px', display: 'inline', color: '#0073bb' }}>Key Requirements</h2>
          </Box>
          <Box textAlign="right" margin={{ right: "l" }}>
            <Link href={"PROJ NARRATIVE COMPS"}>
              <span style={{ color: '#0073bb' }}>Project Narrative Components</span>
            </Link>
          </Box>
          <Box textAlign="right" margin={{ right: "l" }}>
            <Link href={"Eligibility Criteria"}>
              <span style={{ color: '#0073bb' }}>Eligibility Criteria</span>
            </Link>
          </Box>
          <Box textAlign="right" margin={{ right: "l" }}>
            <Link href={"PROJ NARRATIVE COMPS"}>
              <span style={{ color: '#0073bb' }}>Documents Required</span>
            </Link>
          </Box>
          <Box textAlign="right" margin={{ right: "l" }}>
            <Link href={"PROJ NARRATIVE COMPS"}>
              <span style={{ color: '#0073bb' }}>Key Deadlines</span>
            </Link>
          </Box>
        </SpaceBetween>
      </Box>
      <div style={{ 
        borderBottom: '1px solid #dedee2', 
        padding: '8px 0',
        margin: '0 30px'
      }}>
        <Box />
      </div>
      
      <Box margin="xs" padding={{ top: "l" }} textAlign="center">
        <SpaceBetween size="xl">
          <Box textAlign="right" margin={{ right: "l" }}>
            <h2 style={{ fontSize: '24px', display: 'inline', color: '#0073bb' }}>File Upload</h2>
          </Box>
        </SpaceBetween>
      </Box>
      <Box margin={{ horizontal: "l" }}>
        <SpaceBetween size="l">
          <DataFileUpload 
            tabChangeFunction={() => setActiveTab("file")}
          />
          <Button
            variant="link"
            iconName={activeTab === "backend-controls" ? "caret-down" : "caret-up"}
            onClick={() => setActiveTab(activeTab === "backend-controls" ? "" : "backend-controls")}
          >
            Manage Backend Files
          </Button>
          {activeTab === "backend-controls" && (
            <DocumentsTab
              tabChangeFunction={() => setActiveTab("add-data")}
              documentType="file"
              statusRefreshFunction={refreshSyncTime}
              lastSyncTime={lastSyncTime}
              setShowUnsyncedAlert={setShowUnsyncedAlert}
            />
          )}
        </SpaceBetween>
      </Box>
      <div style={{ 
        borderBottom: '1px solid #dedee2', 
        padding: '8px 0',
        margin: '0 30px'
      }}>
        <Box />
      </div>
      
      <Box margin="xs" padding={{ top: "l" }} textAlign="center">
        <SpaceBetween size="xl">
          <Box textAlign="right" margin={{ right: "l" }}>
            <h2 style={{ fontSize: '24px', display: 'inline', color: '#0073bb' }}>Session History</h2>
          </Box>
        </SpaceBetween>
      </Box>
      <div style={{ flex: 1, minHeight: 0 }}>
        {loaded ? (
          <Box margin={{ horizontal: "l" }}>
            <SpaceBetween size="m">
              {items
                .find((section): section is SideNavigationProps.Section => 
                  'text' in section && section.text === "Session History")
                ?.items
                .filter((item): item is SideNavigationProps.Link => 
                  item.type === "link" && 'text' in item)
                .map(session => (
                  <Box textAlign="right" margin={{ right: "l" }} key={session.href}>
                    <Link href={session.href}>
                      <span style={{ color: '#0073bb' }}>{session.text}</span>
                    </Link>
                  </Box>
                ))}
              <Box textAlign="right" margin={{ right: "l" }}>
                <SpaceBetween size="xs" direction="horizontal">
                  <RouterButton 
                    href={`/chatbot/sessions?folder=${encodeURIComponent(docIdentifier || '')}`} 
                    loading={loadingSessions} 
                    variant="link"
                  >
                    View All Sessions
                  </RouterButton>
                  <Button 
                    onClick={onReloadClick} 
                    iconName="refresh" 
                    loading={loadingSessions} 
                    variant="link"
                  >
                    Reload Sessions
                  </Button>
                </SpaceBetween>
              </Box>
            </SpaceBetween>
          </Box>
        ) : (
          <Box textAlign="center">
            <StatusIndicator type="loading">Loading sessions...</StatusIndicator>
          </Box>
        )}
      </div>
    </div>
  );
} 