// frontend-mobile/config.js
import Constants from "expo-constants";
import { Platform } from "react-native";

export function getBaseURL() {
  // Android-emulaattori käyttää hostin localhostiin 10.0.2.2
  if (Platform.OS === "android" && !Constants.executionEnvironment) {
    return "http://10.0.2.2:3001";
  }

  // iOS-simulaattori voi usein käyttää localhostia
  if (Platform.OS === "ios" && !Constants.executionEnvironment) {
    return "http://localhost:3001";
  }

  // Expo Go puhelimessa: käytä koneesi LAN-IP:tä
  // (korvaa alla oleva IP omallasi, esim. 192.168.1.10)
  return "http:/192.168.1.190:3001";
}
