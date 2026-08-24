import Ionicons from 'react-native-vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import BusinessStack from "./BusinessStack";
import CreatorStack from "./CreatorStack";
import HomeStack from "./HomeStack";
import { MainTabParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();

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
