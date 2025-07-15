import { Builder, WebDriver } from "selenium-webdriver";

export async function getDriver(): Promise<WebDriver> {
  return await new Builder().forBrowser("chrome").build();
}
