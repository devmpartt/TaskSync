// frontend-mobile/config.js
import Constants from "expo-constants";
import { Platform } from "react-native";

export function getBaseURL() {
  // Android-emulaattori -> hostin localhost on 10.0.2.2
  if (Platform.OS === "android" && !Constants.executionEnvironment) {
    return "http://10.0.2.2:3001";
  }
  // iOS-simulaattori voi yleensä käyttää localhostia
  if (Platform.OS === "ios" && !Constants.executionEnvironment) {
    return "http://localhost:3001";
  }
  // Expo Go fyysisessä puhelimessa -> käytä Macin LAN-IP:tä
  // Vaihda tämä omaan IP:iin: ipconfig getifaddr en0
  return "http://192.168.0.100:3001";
}
