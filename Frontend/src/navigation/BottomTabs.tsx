import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import BusinessStack from "./BusinessStack";
import CreatorStack from "./CreatorStack";
import HomeStack from "./HomeStack";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#5B3DF5'
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
