import { Box, SpaceBetween, Button } from "@cloudscape-design/components";
import { useState } from "react";
interface HistoryCarouselProps {
  onNOFOSelect: (href: string) => void;
}
const HistoryCarousel: React.FC<HistoryCarouselProps> = ({ onNOFOSelect }) => {
  const [nofos, setNofos] = useState([
    { id: "1", title: "Grid Resilience and Innovative Partnerships" },
    { id: "2", title: "Charging and Fueling Infrastructure Discretionary Grant NOFO" },
    { id: "3", title: "Clean School Bus NOFO" }
  ]);
  return (
    <Box padding={{ top: "m", horizontal: "s" }} margin={{ bottom: "l" }}>
      <SpaceBetween size="s" direction="vertical">
        {nofos.map((nofo) => (
          <Button
            key={nofo.id}
            variant="link"
            onClick={() => {
              console.log("Navigating to NOFO:", nofo.id); // Log navigation
              //onNOFOSelect(/landing-page/basePage/requirements/${nofo.id});
            }}
          >
            {nofo.title}
          </Button>
        ))}
      </SpaceBetween>
    </Box>
  );
};
export default HistoryCarousel;