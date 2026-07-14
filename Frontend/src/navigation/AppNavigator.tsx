import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BottomTabs from './BottomTabs';

// Auth
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import SplashScreen from '../screens/auth/SplashScreen';

// Home
import HomeFeedScreen from '../screens/home/HomeFeedScreen';
import RoleSelectionScreen from '../screens/home/RoleSelectionScreen';

// Talent
import DiscoverTalentScreen from '../screens/talent/DiscoverTalentScreen';

// Composer
import ComposerDashboardScreen from '../screens/composer/ComposerDashboardScreen';
import TuneDetailScreen from '../screens/composer/TuneDetailScreen';
import UploadTuneScreen from '../screens/composer/UploadTuneScreen';

// Lyrics
import LyricsSubmissionScreen from '../screens/lyrics/LyricsSubmissionScreen';

// Singer
import SingerStudioScreen from '../screens/singer/SingerStudioScreen';

// Director
import DirectorStudioScreen from '../screens/director/DirectorStudioScreen';

// AI
import AIAssistantScreen from '../screens/ai/AIAssistantScreen';

// Voting
import VotingScreen from '../screens/voting/VotingScreen';

// Marketplace
import RightsDetailScreen from '../screens/marketplace/RightsDetailScreen';
import RightsMarketplaceScreen from '../screens/marketplace/RightsMarketplaceScreen';

// Projects
import MyProjectsScreen from '../screens/projects/MyProjectsScreen';
import ProjectWorkspaceScreen from '../screens/projects/ProjectWorkspaceScreen';

// Profile
import CreatorProfileScreen from '../screens/profile/CreatorProfileScreen';

// Producer
import ProducerDashboardScreen from '../screens/producer/ProducerDashboardScreen';

// Revenue
import RevenueDashboardScreen from '../screens/revenue/RevenueDashboardScreen';

// Notifications
import NotificationsCenterScreen from '../screens/notifications/NotificationsCenterScreen';

// Settings
import SettingsPreferencesScreen from '../screens/settings/SettingsPreferencesScreen';
import ChangePasswordScreen from '../screens/settings/ChangePasswordScreen';
import DefaultRoleScreen from '../screens/settings/DefaultRoleScreen';
import ComingSoonScreen from '../screens/settings/ComingSoonScreen';
import HelpCenterScreen from '../screens/settings/HelpCenterScreen';
import TermsConditionsScreen from '../screens/settings/TermsConditionsScreen';

// Subscription
import SubscriptionPlansScreen from '../screens/subscription/SubscriptionPlansScreen';

// Wallet
import WalletPaymentsScreen from '../screens/wallet/WalletPaymentsScreen';

// Analytics
import AnalyticsDashboardScreen from '../screens/analytics/AnalyticsDashboardScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  console.log('*** CSN AppNavigator Loaded ***');

  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Authentication */}
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
      />

      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />

      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
      />

      <Stack.Screen
        name="RoleSelection"
        component={RoleSelectionScreen}
      />

      {/* Main App */}
      <Stack.Screen
        name="Main"
        component={BottomTabs}
      />

      {/* Home */}
      <Stack.Screen
        name="HomeFeed"
        component={HomeFeedScreen}
      />

      {/* Talent Discovery */}
      <Stack.Screen
        name="DiscoverTalent"
        component={DiscoverTalentScreen}
      />

      {/* Composer */}
      <Stack.Screen
        name="ComposerDashboard"
        component={ComposerDashboardScreen}
      />

      <Stack.Screen
        name="UploadTune"
        component={UploadTuneScreen}
      />

      <Stack.Screen
        name="TuneDetail"
        component={TuneDetailScreen}
      />

      {/* Lyrics */}
      <Stack.Screen
        name="LyricsSubmission"
        component={LyricsSubmissionScreen}
      />

      {/* Singer */}
      <Stack.Screen
        name="SingerStudio"
        component={SingerStudioScreen}
      />

      {/* Director */}
      <Stack.Screen
        name="DirectorStudio"
        component={DirectorStudioScreen}
      />

      {/* AI Assistant */}
      <Stack.Screen
        name="AIAssistant"
        component={AIAssistantScreen}
      />

      {/* Voting */}
      <Stack.Screen
        name="Voting"
        component={VotingScreen}
      />

      {/* Marketplace */}
      <Stack.Screen
        name="RightsMarketplace"
        component={RightsMarketplaceScreen}
      />

      <Stack.Screen
        name="RightsDetail"
        component={RightsDetailScreen}
      />

      {/* Projects */}
      <Stack.Screen
        name="MyProjects"
        component={MyProjectsScreen}
      />

      <Stack.Screen
        name="ProjectWorkspace"
        component={ProjectWorkspaceScreen}
      />

      {/* Profile */}
      <Stack.Screen
        name="CreatorProfile"
        component={CreatorProfileScreen}
      />

      {/* Producer */}
      <Stack.Screen
        name="ProducerDashboard"
        component={ProducerDashboardScreen}
      />

      {/* Revenue */}
      <Stack.Screen
        name="RevenueDashboard"
        component={RevenueDashboardScreen}
      />

      {/* Notifications */}
      <Stack.Screen
        name="NotificationsCenter"
        component={NotificationsCenterScreen}
      />

      {/* Settings */}
      <Stack.Screen
        name="SettingsPreferences"
        component={SettingsPreferencesScreen}
      />

      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
      />

      <Stack.Screen
        name="DefaultRole"
        component={DefaultRoleScreen}
      />

      <Stack.Screen
        name="ComingSoon"
        component={ComingSoonScreen}
      />

      <Stack.Screen
        name="HelpCenter"
        component={HelpCenterScreen}
      />

      <Stack.Screen
        name="TermsConditions"
        component={TermsConditionsScreen}
      />

      {/* Subscription */}
      <Stack.Screen
        name="SubscriptionPlans"
        component={SubscriptionPlansScreen}
      />

      {/* Wallet */}
      <Stack.Screen
        name="WalletPayments"
        component={WalletPaymentsScreen}
      />

      {/* Analytics */}
      <Stack.Screen
        name="AnalyticsDashboard"
        component={AnalyticsDashboardScreen}
      />
    </Stack.Navigator>
  );
}