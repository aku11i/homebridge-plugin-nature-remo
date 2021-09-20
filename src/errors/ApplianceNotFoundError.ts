export class ApplianceNotFoundError extends Error {
  constructor(applianceName: string) {
    super(`The appliance "${applianceName}" is not found.`);
    this.name = "ApplianceNotFoundError";
  }
}
