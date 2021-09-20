export class ConfigNotDefinedError extends Error {
  constructor(configName: string) {
    super(`"${configName}" is not defined in config.`);
    this.name = "ConfigNotDefinedError";
  }
}
