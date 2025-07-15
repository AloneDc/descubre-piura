import { By, until, WebDriver } from "selenium-webdriver";

export async function login(
  driver: WebDriver,
  email: string,
  password: string
) {
  await driver.get("http://localhost:3000/auth/login");

  const emailInput = await driver.findElement(By.name("email"));
  const passwordInput = await driver.findElement(By.name("password"));
  const submitButton = await driver.findElement(
    By.css("button[type='submit']")
  );

  await emailInput.sendKeys(email);
  await passwordInput.sendKeys(password);
  await submitButton.click();
}
