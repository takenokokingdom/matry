import { Image, StyleSheet, Text, View } from "react-native";
import {
  DEFAULT_THEME,
  type ThemeName,
  getIconComponent,
} from "../../../shared/lib/icons/registry";

type Props = {
  iconName?: string | null;
  iconImageUrl?: string | null;
  label?: string;
  size?: number;
  theme?: ThemeName;
  backgroundColor?: string;
  iconColor?: string;
};

export default function AppIcon({
  iconName,
  iconImageUrl,
  label,
  size = 56,
  theme = DEFAULT_THEME,
  backgroundColor = "#007AFF",
  iconColor = "#fff",
}: Props) {
  const containerStyle = [
    styles.container,
    { width: size, height: size, borderRadius: size * 0.22, backgroundColor },
  ];

  if (iconImageUrl) {
    return (
      <View style={containerStyle}>
        <Image
          source={{ uri: iconImageUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      </View>
    );
  }

  if (iconName) {
    const IconComponent = getIconComponent(iconName, theme);
    if (IconComponent) {
      return (
        <View style={containerStyle}>
          <IconComponent size={size * 0.5} color={iconColor} />
        </View>
      );
    }
  }

  return (
    <View style={containerStyle}>
      <Text
        style={[
          styles.fallbackText,
          { fontSize: size * 0.4, color: iconColor },
        ]}
      >
        {label?.slice(0, 1) ?? "?"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  fallbackText: { fontWeight: "bold" },
});
