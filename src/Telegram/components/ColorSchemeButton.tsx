import React from "react";
import Feather from "@expo/vector-icons/Feather";
import { Pressable } from "react-native";

import { useColorScheme, useTheme } from "../../components";

export const ColorSchemeButton = () => {
  const theme = useTheme();
  const { toggle, colorScheme } = useColorScheme();
  return (
    <Pressable onPress={() => toggle()}>
      <Feather
        name={colorScheme === "light" ? "moon" : "sun"}
        color={theme.colors.mainForeground}
        size={32}
      />
    </Pressable>
  );
};
