import { API } from "homebridge";
import { NatureRemoLightbulb } from "./plugins/lightbulb";

module.exports = (homebridge: API) => {
  homebridge.registerAccessory("NatureRemoLightbulb", NatureRemoLightbulb);
};
