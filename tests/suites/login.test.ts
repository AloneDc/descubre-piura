import { getDriver } from "../config/driver";
import { login } from "../helpers/login";
import { By, until, WebDriver } from "selenium-webdriver";
import { strict as assert } from "assert";

describe("Login Tests", function () {
  this.timeout(20000); // tiempo máximo por test
  let driver: WebDriver;

  beforeEach(async () => {
    driver = await getDriver();
  });

  afterEach(async () => {
    await driver.quit();
  });

  it("Debería fallar el login con credenciales incorrectas", async () => {
    await login(driver, "wrong@email.com", "wrongpassword");

    const errorElement = await driver.wait(
      until.elementLocated(By.css("p.text-red-600")),
      8000
    );

    const errorText = await errorElement.getText();
    assert.ok(
      errorText.toLowerCase().includes("error al iniciar sesión") ||
        errorText.toLowerCase().includes("invalid login credentials"),
      `Mensaje de error inesperado: ${errorText}`
    );
  });

  it("Debería hacer login y redirigir a /admin", async () => {
    await login(driver, "eduardev0911@gmail.com", "admin1234");

    await driver.wait(until.urlContains("/admin"), 10000);
    const currentUrl = await driver.getCurrentUrl();
    assert.ok(
      currentUrl.includes("/admin"),
      "No redireccionó al admin correctamente"
    );
  });
});
