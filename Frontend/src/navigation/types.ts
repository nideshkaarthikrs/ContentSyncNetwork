import { RightsListing } from "../api/services/rights.api";

// Draft sign-up details carried from SignUpScreen to RoleSelectionScreen. Shaped
// after exactly what SignUpScreen.handleNext passes -- see auth/SignUpScreen.tsx.
export interface SignUpDraft {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
}

// One entry per `<Stack.Screen name="X" .../>` in AppNavigator.tsx (both the
// `!token` and `token` branches), value = the param type for that route.
// `undefined` means the route takes no params.
export type RootStackParamList = {
  // Auth (rendered only while logged out)
  Login: undefined;
  SignUp: undefined;
  RoleSelection: { draft: SignUpDraft };

  // Main app (nested tab navigator -- takes no params of its own)
  Main: undefined;

  // Home
  HomeFeed: undefined;

  // Composer
  ComposerDashboard: undefined;
  UploadTune: undefined;
  // Always navigated to with a tuneId (ComposerDashboardScreen); a caller that
  // forgets it is now a tsc error instead of a blank/broken detail screen.
  TuneDetail: { tuneId: string };

  // Lyrics / Singer / Director: reachable either from TuneDetailScreen (always
  // passes tuneId + tuneTitle) or from a tab-grid card with no params at all
  // (see HomeStack/CreatorStack `*Modules` arrays) -- so both fields stay optional
  // and the whole params object may be omitted.
  LyricsSubmission: { tuneId?: string; tuneTitle?: string } | undefined;
  SingerStudio: { tuneId?: string; tuneTitle?: string } | undefined;
  DirectorStudio: { tuneId?: string; tuneTitle?: string } | undefined;

  // AI Assistant
  AIAssistant: undefined;

  // Voting
  Voting: undefined;

  // Marketplace
  RightsMarketplace: undefined;
  // Always navigated to with the selected listing (RightsMarketplaceScreen);
  // required so a future caller that forgets it is a tsc error, not a
  // dead-end detail screen (the exact bug class P3 fixed for this route).
  RightsDetail: { listing: RightsListing };

  // Projects
  MyProjects: undefined;
  // Reachable with no params (create-new flow), with just a projectId
  // (NotificationsCenterScreen), or with projectId + projectName (MyProjectsScreen).
  ProjectWorkspace: { projectId?: string; projectName?: string } | undefined;

  // Profile
  CreatorProfile: undefined;

  // Revenue
  RevenueDashboard: undefined;

  // Notifications
  NotificationsCenter: undefined;

  // Settings
  SettingsPreferences: undefined;
  ChangePassword: undefined;
  DefaultRole: undefined;
  // Generic placeholder screen; reachable with or without a title override.
  ComingSoon: { title?: string } | undefined;
  HelpCenter: undefined;
  TermsConditions: undefined;

  // Subscription
  SubscriptionPlans: undefined;

  // Wallet
  WalletPayments: undefined;

  // Analytics
  AnalyticsDashboard: undefined;
};

// The three Tab.Screen names in BottomTabs.tsx -- none take params.
export type MainTabParamList = {
  Creator: undefined;
  Home: undefined;
  Business: undefined;
};

// Standard React Navigation v6 global augmentation: makes untyped
// useNavigation()/useRoute() calls elsewhere in the app check against
// RootStackParamList too. This file is on the tsconfig include path (no
// explicit "include" is set, so all .ts/.tsx files under the project are
// compiled) and is also imported by AppNavigator.tsx, so this augmentation
// is always part of the compiled program.
declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface RootParamList extends RootStackParamList {}
  }
}
