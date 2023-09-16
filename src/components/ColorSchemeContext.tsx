import type { SkImage } from "@shopify/react-native-skia";
import {
  Canvas,
  Circle,
  Image,
  ImageShader,
  dist,
  makeImageFromView,
  mix,
  vec,
} from "@shopify/react-native-skia";
import { StatusBar } from "expo-status-bar";
import type { ReactNode, RefObject } from "react";
import { createContext, useCallback, useContext, useReducer, useRef } from "react";
import { Appearance, Dimensions, StyleSheet, View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { useDerivedValue, useSharedValue, withTiming } from "react-native-reanimated";

const wait = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type ColorSchemeName = "light" | "dark";

interface ColorScheme {
  colorScheme: ColorSchemeName;
  overlay1: SkImage | null;
  overlay2: SkImage | null;
  active: boolean;
  statusBarColor: ColorSchemeName;
}

interface ColorSchemeContext extends ColorScheme {
  dispatch: (scheme: ColorScheme) => void;
  ref: RefObject<View>;
  circle: SharedValue<{ x: number; y: number; r: number }>;
  transition: SharedValue<number>;
}

const defaultValue: ColorScheme = {
  statusBarColor: (Appearance.getColorScheme() ?? "light") === "light" ? "dark" : "light",
  colorScheme: Appearance.getColorScheme() ?? "light",
  overlay1: null,
  overlay2: null,
  active: false,
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
  const { colorScheme, ref, circle, transition, active, dispatch } = ctx;
  const toggle = useCallback(
    async (x: number, y: number) => {
      const newColorScheme = colorScheme === "light" ? "dark" : "light";
      dispatch({
        active: true,
        colorScheme,
        overlay1: null,
        overlay2: null,
        statusBarColor: newColorScheme,
      });

      circle.value = { x, y, r: Math.max(...corners.map((corner) => dist({ x, y }, corner))) };

      const overlay1 = await makeImageFromView(ref);

      dispatch({
        active: true,
        colorScheme: newColorScheme,
        overlay1,
        overlay2: null,
        statusBarColor: newColorScheme,
      });

      await wait(16);

      const overlay2 = await makeImageFromView(ref);

      dispatch({
        active: true,
        colorScheme: newColorScheme,
        overlay1,
        overlay2,
        statusBarColor: newColorScheme,
      });
      transition.value = 0;
      const duration = 650;
      transition.value = withTiming(1, { duration });
      await wait(duration);
      dispatch({
        active: false,
        colorScheme: newColorScheme,
        overlay1: null,
        overlay2: null,
        statusBarColor: newColorScheme === "light" ? "dark" : "light",
      });
    },
    [colorScheme, dispatch, ref, circle, transition]
  );
  return { colorScheme, toggle, active };
};

interface ColorSchemeProviderProps {
  children: ReactNode;
}

const { width, height } = Dimensions.get("window");
const corners = [vec(0, 0), vec(width, 0), vec(width, height), vec(0, height)];

export const ColorSchemeProvider = ({ children }: ColorSchemeProviderProps) => {
  const transition = useSharedValue(0);
  const circle = useSharedValue({ x: 0, y: 0, r: 0 });
  const ref = useRef(null);
  const [{ colorScheme, overlay1, overlay2, active, statusBarColor }, dispatch] = useReducer(
    colorSchemeReducer,
    defaultValue
  );

  const r = useDerivedValue(() => mix(transition.value, 0, circle.value.r));

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style={statusBarColor} />
      <View style={{ flex: 1 }} ref={ref}>
        <ColorSchemeContext.Provider
          value={{
            colorScheme,
            dispatch,
            ref,
            overlay1,
            overlay2,
            circle,
            transition,
            active,
            statusBarColor,
          }}
        >
          {children}
        </ColorSchemeContext.Provider>
      </View>

      {active && (
        <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
          <Image image={overlay1} x={0} y={0} width={width} height={height} />
          {overlay2 && (
            <Circle c={circle} r={r}>
              <ImageShader
                image={overlay2}
                x={0}
                y={0}
                width={width}
                height={height}
                fit={"cover"}
              />
            </Circle>
          )}
        </Canvas>
      )}
    </View>
  );
};
