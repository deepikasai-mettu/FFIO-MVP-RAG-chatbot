import { useState } from "react";
import BaseAppLayout from "../../../components/base-app-layout";
import Sessions from "../../../components/chatbot/sessions";
import { BreadcrumbGroup } from "@cloudscape-design/components";
import { CHATBOT_NAME } from "../../../common/constants";
import useOnFollow from "../../../common/hooks/use-on-follow";
import { useSearchParams } from "react-router-dom";

export default function SessionPage() {
  const [toolsOpen, setToolsOpen] = useState(false);
  const onFollow = useOnFollow();
  const [ searchParams ] = useSearchParams();
  const documentIdentifier = searchParams.get("folder");

  return (
    <BaseAppLayout
      contentType="table"
      //toolsOpen={toolsOpen}
      //onToolsChange={(e) => setToolsOpen(e.detail.open)}
      breadcrumbs={
        <BreadcrumbGroup
          onFollow={onFollow}
          items={[
            {
              text: CHATBOT_NAME,
              href: "/",
            },
            {
              text: "Sessions",
              href: "/chatbot/sessions",
            },
          ]}
        />
      }
      content={<Sessions toolsOpen={true} documentIdentifier={documentIdentifier} />}
    />
  );
}
