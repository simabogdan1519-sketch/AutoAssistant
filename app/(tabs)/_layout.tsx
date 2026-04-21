import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, Platform } from 'react-native';
import { Colors } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(10,10,10,0.92)',
          borderTopWidth: 1,
          borderTopColor: Colors.line,
          height: Platform.OS === 'ios' ? 84 : 70,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 24 : 12,
          elevation: 0,
        },
        tabBarActiveTintColor: Colors.ink,
        tabBarInactiveTintColor: Colors.inkDim,
        tabBarLabelStyle: {
          fontFamily: 'JetBrainsMono_500Medium',
          fontSize: 9,
          letterSpacing: 1,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'HOME',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="garaj"
        options={{
          title: 'GARAJ',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="car-sport-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="docs"
        options={{
          title: 'DOCS',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="document-text-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="eu"
        options={{
          title: 'EU',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person-outline" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

function TabIcon({
  name,
  color,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
}) {
  return (
    <View style={{ alignItems: 'center' }}>
      {focused && <View style={styles.activeBar} />}
      <Ionicons name={name} size={20} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  activeBar: {
    position: 'absolute',
    top: -10,
    width: 20,
    height: 2,
    backgroundColor: Colors.accent,
  },
});
