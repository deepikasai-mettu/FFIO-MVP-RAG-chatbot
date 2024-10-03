// import Carousel from 'react-multi-carousel';
// import {ResponsiveType} from 'react-multi-carousel/lib/types';
// import 'react-multi-carousel/lib/styles.css';
import {TaskCard} from '../components/caro-card';
import {v4 as uuidv4} from "uuid";
import {Mode} from "@cloudscape-design/global-styles";

interface CarouselNextProps {
    theme: Mode;
}

const CarouselNext = ({theme}: CarouselNextProps) => {
    // const BreakpointSlides: ResponsiveType = {
    //     desktop: {
    //         breakpoint: {max: 3000, min: 1024},
    //         items: 3,
    //         partialVisibilityGutter: 0
    //     },
    //     tablet: {
    //         breakpoint: {max: 1024, min: 530},
    //         items: 2,
    //         partialVisibilityGutter: 0
    //     },
    //     mobile: {
    //         breakpoint: {max: 530, min: 0},
    //         items: 1,
    //         partialVisibilityGutter: 0
    //     },
    // };

    // return (
    //     <Carousel
    //         responsive={BreakpointSlides}
    //         //itemClass="carousel-item"
    //         //containerClass="carousel-container"
    //         autoPlay={true}
    //         slidesToSlide={1}
    //         // additionalTransfrom={0}
    //         // arrows
    //         autoPlaySpeed={3000}
    //         // centerMode={false}
    //         draggable
    //         focusOnSelect={true}
    //         // infinite={false}
    //         //keyBoardControl
    //         //minimumTouchDrag={80}
    //         pauseOnHover
    //         //renderArrowsWhenDisabled={false}
    //         //renderButtonGroupOutside={false}
    //         //renderDotsOutside={false}
    //         rewind={true}
    //         rewindWithAnimation={true}
    //         //rtl={false}
    //         shouldResetAutoplay
    //         //showDots={false}
    //         //swipeable
    //     >
    //         <TaskCard
    //             name="ccg-grant"
    //             cardTitle="Community Change Grant"
    //             taskDescription="Assist with "
    //             instructions="Select to view requirements"
    //             url={`/chatbot/task-playground/${uuidv4()}/summarize`}
    //             theme={theme}
    //         />
    //         <TaskCard
    //             name="DEG"
    //             cardTitle="Digital Equity"
    //             taskDescription="Assist with "
    //             instructions="Select to view requirements"
    //             url={`/chatbot/task-playground/${uuidv4()}/translate`}
    //             theme={theme}
    //         />
    //     </Carousel>
   // );
};

export default CarouselNext;