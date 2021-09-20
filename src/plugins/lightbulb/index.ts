import type {
  API,
  AccessoryPlugin,
  Logger,
  AccessoryConfig,
  Service,
  CharacteristicGetHandler,
  CharacteristicSetHandler,
} from "homebridge";

import { NatureRemoApi, Configuration } from "../../api";
import { ApplianceNotFoundError } from "../../errors/ApplianceNotFoundError";
import { ConfigNotDefinedError } from "../../errors/ConfigNotDefinedError";
import { Command } from "../../types";

export type NatureRemoLightbulbConfig = AccessoryConfig & {
  accessToken: string;
  id: string;
  powerMapper?: Record<string, string | undefined>;
  brightnessMapper?: Record<`${number}`, Command | undefined>;
  defaultBrightness?: number;
};

export class NatureRemoLightbulb implements AccessoryPlugin {
  private readonly natureRemo: NatureRemoApi;
  private readonly homebridge: API;
  private readonly logger: Logger;
  private readonly config: NatureRemoLightbulbConfig;

  private brightness: number;

  constructor(logger: Logger, config: AccessoryConfig, homebridge: API) {
    this.homebridge = homebridge;
    this.logger = logger;

    if (!config.id) {
      throw new ConfigNotDefinedError("id");
    }
    if (!config.accessToken) {
      throw new ConfigNotDefinedError("accesstoken");
    }

    this.config = config as NatureRemoLightbulbConfig;

    this.brightness = this.config.defaultBrightness ?? 80;
    this.natureRemo = new NatureRemoApi(
      new Configuration({ accessToken: this.config.accessToken })
    );
  }

  getServices(): Service[] {
    const service = new this.homebridge.hap.Service.Lightbulb(this.config.name);

    service
      .getCharacteristic(this.homebridge.hap.Characteristic.On)
      .onGet(this.handleOnGet)
      .onSet(this.handleOnSet);

    if (this.config.brightnessMapper) {
      service
        .getCharacteristic(this.homebridge.hap.Characteristic.Brightness)
        .onGet(this.handleBrightnessGet)
        .onSet(this.handleBrightnessSet);
    }

    return [service];
  }

  private handleOnGet: CharacteristicGetHandler = async () => {
    const { data } = await this.natureRemo._1appliancesGet();
    const appliance = data.find((_) => _.id === this.config.id);
    if (!appliance) {
      throw new ApplianceNotFoundError(this.config.id);
    }

    return appliance.light!.state!.power === "off" ? 0 : 1;
  };

  private handleOnSet: CharacteristicSetHandler = async (power) => {
    this.logger.debug("handleOnSet", { power });

    if (this.config.brightnessMapper) {
      if (power && this.brightness === 0) {
        this.brightness = this.config.defaultBrightness ?? 80;
      } else if (!power) {
        this.brightness = 0;
      }

      return await this.setBrightness(this.brightness);
    }

    await this.natureRemo._1appliancesApplianceLightPost(
      this.config.id,
      power
        ? this.config.powerMapper?.on ?? "on"
        : this.config.powerMapper?.off ?? "off"
    );
  };

  private handleBrightnessGet: CharacteristicGetHandler = async () => {
    return this.brightness;
  };

  private handleBrightnessSet: CharacteristicSetHandler = async (
    brightness
  ) => {
    this.logger.debug("handleBrightnessSet", { brightness });

    if (typeof brightness !== "number") return;

    this.brightness = brightness;
    this.setBrightness(this.brightness);
  };

  private async setBrightness(brightness: number) {
    let command: Command | undefined = undefined;

    for (let i = brightness; i <= 100; i++) {
      const value = this.config.brightnessMapper![`${i}`];
      if (value) {
        command = value;
        break;
      }
    }

    if (!command) return;

    if (command.button) {
      this.logger.debug("send", command);
      await this.natureRemo._1appliancesApplianceLightPost(
        this.config.id,
        command.button
      );
    } else if (command.signal) {
      this.logger.debug("send", command);
      await this.natureRemo._1signalsSignalSendPost(command.signal);
    }
  }
}
