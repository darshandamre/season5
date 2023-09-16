import {
  makeImageFromView,
  Image,
  Canvas,
  mix,
  vec,
  ImageShader,
  Circle,
  dist,
} from "@shopify/react-native-skia";
import type { SkImage } from "@shopify/react-native-skia";
import { StatusBar } from "expo-status-bar";
import type { ReactNode, RefObject } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useReducer,
  useRef,
} from "react";
import { Appearance, Dimensions, View, StyleSheet } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import {
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const wait = async (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export type ColorSchemeName = "light" | "dark";

interface ColorScheme {
  colorScheme: ColorSchemeName;
}

interface ColorSchemeContext extends ColorScheme {
  dispatch: (scheme: ColorScheme) => void;
}

const defaultValue: ColorScheme = {
  colorScheme: Appearance.getColorScheme() ?? "light",
};

const ColorSchemeContext = createContext<ColorSchemeContext | null>(null);

const colorSchemeReducer = (_: ColorScheme, colorScheme: ColorScheme) => {
  return colorScheme;
};

export const useColorScheme = () => {
  const ctx = useContext(ColorSchemeContext);
  if (ctx === null) {
    throw new Error("No ColorScheme context context found");
  }
  const { colorScheme, dispatch } = ctx;
  const toggle = useCallback(async () => {
    const newColorScheme = colorScheme === "light" ? "dark" : "light";
    dispatch({
      colorScheme: newColorScheme,
    });
  }, [colorScheme, dispatch]);
  return { colorScheme, toggle };
};

interface ColorSchemeProviderProps {
  children: ReactNode;
}

const { width, height } = Dimensions.get("window");
const corners = [vec(0, 0), vec(width, 0), vec(width, height), vec(0, height)];

export const ColorSchemeProvider = ({ children }: ColorSchemeProviderProps) => {
  const [{ colorScheme }, dispatch] = useReducer(
    colorSchemeReducer,
    defaultValue
  );
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style={colorScheme === "light" ? "dark" : "light"} />
      <View style={{ flex: 1 }}>
        <ColorSchemeContext.Provider
          value={{
            colorScheme,
            dispatch,
          }}
        >
          {children}
        </ColorSchemeContext.Provider>
      </View>
    </View>
  );
};
