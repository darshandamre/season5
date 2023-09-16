import React from "react";
import Feather from "@expo/vector-icons/Feather";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useColorScheme, useTheme } from "../../components";

export const ColorSchemeButton = () => {
  const theme = useTheme();
  const { toggle, colorScheme, active } = useColorScheme();
  const pan = Gesture.Pan()
    .runOnJS(true)
    .onBegin((e) => {
      if (!active) {
        toggle(e.absoluteX, e.absoluteY);
      }
    });

  return (
    <GestureDetector gesture={pan}>
      <Feather
        name={colorScheme === "light" ? "moon" : "sun"}
        color={theme.colors.mainForeground}
        size={32}
      />
    </GestureDetector>
  );
};
