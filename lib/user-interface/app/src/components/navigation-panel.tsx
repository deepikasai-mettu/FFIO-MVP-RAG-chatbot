import {
  SideNavigation,
  SideNavigationProps,
  Header,
  Button,
  Link,
  Box,
  StatusIndicator,
  SpaceBetween
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
  
  console.log("NAV PANEL: ", documentIdentifier);

  const loadSessions = async () => {
    let username;
    try {
      await Auth.currentAuthenticatedUser().then((value) => username = value.username);
      if (username && needsRefresh) {
        const fetchedSessions = await apiClient.sessions.getSessions(username);
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
        text: "Session History",
        items: sessions.map(session => ({
          type: "link",
          text: session.title,
          href: `/chatbot/playground/${session.session_id}`,
        })).concat([{
          type: "link",
          info: (
            <Box margin="xxs" textAlign="center">
              <RouterButton href="/chatbot/sessions" loading={loadingSessions} variant="link">View All Sessions</RouterButton>
              <Button onClick={onReloadClick} iconName="refresh" loading={loadingSessions} variant="link">Reload Sessions</Button>
            </Box>
          ),
        }]),
      },
      {
        type: "section",
        text: "Resources",
        items: [
          { type: "link", text: "Upload Data", href: `/admin/data?folder=${encodeURIComponent(documentIdentifier)}` },
          {
            type: "link",
            text: "Prompt Engineering Guide",
            href: "/images/Prompt Suggestions for Grantwell's Chatbot Users.pdf",
            external: true
          },
          { type: "link", text: "Provide Feedback", href: "https://forms.gle/jNHk8usCSNBzhL998", external: true },
      //   ],
      // },
      // {
      //   type: "section",
      //   text: "Additional Resources",
      //   items: [
          // {
          //   type: "link",
          //   text: "Federal Grant Application Resources",
          //   href: "https://www.mass.gov/lists/federal-funds-grant-application-resources",
          //   external: true
          // },
          // {
          //   type: "link",
          //   text: "Register for Federal Funds Partnership Meetings",
          //   href: "https://us02web.zoom.us/meeting/register/tZUucuyhrzguHNJkkh-XlmZBlQQKxxG_Acjl",
          //   external: true
          // }
        ]
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

  return (
    <div>
      <Box margin="xs" padding={{ top: "l" }} textAlign="center">
      <SpaceBetween size="xl">
        <Button 
          onClick={() => navigate(`/landing-page/basePage/checklists/${encodeURIComponent(documentIdentifier)}`)}
          variant="primary"
          aria-label="Return to Home Page"
          iconSvg={<BackArrowIcon />}
        >
          Back to requirements
        </Button>

        <RouterButton
          iconAlign="right"
          iconSvg={<PencilSquareIcon />}
          variant="primary"
          href={`/chatbot/playground/${uuidv4()}`}
          data-alignment="right"
          className="new-chat-button"
          style={{ textAlign: "right" }}
        >
          Start new session
        </RouterButton>
        </SpaceBetween>
      </Box>
      {loaded ? (
        <SideNavigation
          activeHref={activeHref}
          onFollow={event => {
            if (!event.detail.external) {
              event.preventDefault();
              setActiveHref(event.detail.href);
              onFollow(event);
            }
          }}
          onChange={onChange}
          items={items}
        />
      ) : (
        <Box margin="xs" padding="xs" textAlign="center">
          <StatusIndicator type="loading">Loading sessions...</StatusIndicator>
        </Box>
        
      )}
    </div>
  );
}


// Collapsible resource cards section (potentially consider circling back to this in future)
// <Box margin="xs" padding="xs">
// <Box
//   display="flex"
//   alignItems="center"
//   justifyContent="space-between"
//   style={{ cursor: "pointer" }}
//   onClick={() => setIsResourcesCollapsed(!isResourcesCollapsed)}
// >
//   <Header variant="h3">Resources</Header>
//   <Button
//     iconName={isResourcesCollapsed ? "caret-down" : "caret-up"}
//     variant="icon"
//     ariaLabel="Toggle resources visibility"
//     onClick={() => setIsResourcesCollapsed(!isResourcesCollapsed)}
//   />
// </Box>
// {!isResourcesCollapsed && (
//   <Cards
//     cardDefinition={{
//       header: (item) => (
//         <Link href={item.href} external={item.external} fontSize="heading-s">
//           {item.name}
//         </Link>
//       ),
//       sections: [
//         {
//           content: (item) => (
//             <div style={{ minHeight: '10px' }}>
//             </div>
//           ),
//         },
//         {
//           content: (item) => <div>{item.description}</div>,
//         },
//       ],
//     }}
//     cardsPerRow={[{ cards: 1 }, { minWidth: 300, cards: 3 }]}
//     items={[
//       {
//         name: "Prompt Suggestions for Effective Chatbot Use",
//         external: false,
//         href: "/images/Prompt Suggestions for Grantwell's Chatbot Users.pdf",
//         img: "/images/Welcome/promptSuggestions.png",
//         altText: "Illustration of a person interacting with a chatbot on a smartphone, with the chatbot displayed on a large screen and speech bubbles representing the conversation.",
//         description: "Learn how to interact with our chatbot for application guidance.",
//       },
//       {
//         name: "Federal Grant Application Resources",
//         external: true,
//         href: "https://www.mass.gov/lists/federal-funds-grant-application-resources",
//         img: "/images/Welcome/resources.png",
//         altText: "Skyline of downtown Boston at sunset, featuring historic and modern buildings",
//         description: "Access categorized grant resources for streamlined applications.",
//       },
//       {
//         name: "Register for Federal Funds Partnership Meetings",
//         external: true,
//         href: "https://us02web.zoom.us/meeting/register/tZUucuyhrzguHNJkkh-XlmZBlQQKxxG_Acjl",
//         img: "/images/Welcome/massFlag.png",
//         altText: "The Massachusetts state flag waving in the wind",
//         description: "Stay updated on funding opportunities by joining our monthly sessions.",
//       },
//     ]}
//   />
// )}
// </Box>
// </div>
// );
// }