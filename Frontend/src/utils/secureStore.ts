import * as Keychain from "react-native-keychain";

/**
 * expo-secure-store-shaped wrapper around react-native-keychain, which stores
 * username/password pairs rather than arbitrary key-value entries — each key
 * gets its own Keychain `service` with a fixed username.
 */
const USERNAME = "csn";

export async function getItemAsync(key: string): Promise<string | null> {
  const credentials = await Keychain.getGenericPassword({ service: key });
  return credentials ? credentials.password : null;
}

export async function setItemAsync(key: string, value: string): Promise<void> {
  await Keychain.setGenericPassword(USERNAME, value, { service: key });
}

export async function deleteItemAsync(key: string): Promise<void> {
  await Keychain.resetGenericPassword({ service: key });
}
