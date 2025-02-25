import { Text, keyframes } from '@chakra-ui/react';

const focusInExpand = keyframes`
  0% {
    letter-spacing: -0.5em;
    filter: blur(12px);
    opacity: 0;
  }
  100% {
    filter: blur(0px);
    opacity: 1;
  }
`;

const TrueFocus = () => (
  <Text
    fontSize="xl"
    fontWeight="bold"
    color="blue.600"
    animation={`${focusInExpand} 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) both`}
  >
    InsightHub
  </Text>
);

export default TrueFocus; 