import Ionicons from 'react-native-vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import BusinessStack from "./BusinessStack";
import CreatorStack from "./CreatorStack";
import HomeStack from "./HomeStack";
import { MainTabParamList } from "./types";
import { useTheme } from "../theme/useTheme";

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function BottomTabs() {
  const theme = useTheme();
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary
      }}
    >

      <Tab.Screen
        name="Creator"
        component={CreatorStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="planet" size={size} color={color} />
          )
        }}
      />

      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          )
        }}
      />

      <Tab.Screen
        name="Business"
        component={BusinessStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flower" size={size} color={color} />
          )
        }}
      />

    </Tab.Navigator>
  );
}
