const { Builder, By, until } = require("selenium-webdriver");
const fs = require("fs");

(async function testAdminAccessRestriction() {
  const driver = await new Builder().forBrowser("chrome").build();
  const LOGIN_URL = "http://localhost:3000/auth/login";
  const ADMIN_URL = "http://localhost:3000/admin";

  try {
    // === Paso 1: Login con usuario común ===
    await driver.get(LOGIN_URL);

    await driver
      .findElement(By.name("email"))
      .sendKeys("danieleduar0911@gmail.com");
    await driver.findElement(By.name("password")).sendKeys("admin1234");
    await driver.findElement(By.css("button[type='submit']")).click();

    // Esperar redirección a /perfil
    await driver.wait(until.urlContains("/perfil"), 8000);
    const currentUrl = await driver.getCurrentUrl();
    console.assert(
      currentUrl.includes("/perfil"),
      `❌ No redirigió a /perfil correctamente. URL actual: ${currentUrl}`
    );

    console.log("✅ Login de usuario común redirige a /perfil");

    // === Paso 2: Intentar acceder a /admin directamente ===
    await driver.get(ADMIN_URL);

    // Esperar que no cargue contenido de admin o muestre mensaje de rechazo
    const bodyText = await driver.findElement(By.tagName("body")).getText();

    console.assert(
      !bodyText.includes("Panel de administración") && // ajusta esto según el contenido real
        (bodyText.includes("No autorizado") ||
          bodyText.includes("Acceso denegado") ||
          bodyText.includes("Debes iniciar sesión") ||
          driver.getCurrentUrl().then((url) => !url.includes("/admin"))),
      "❌ Usuario común pudo acceder a /admin"
    );

    console.log("✅ Usuario común NO puede acceder a /admin");
  } catch (error) {
    console.error(
      "❌ Test de restricción de admin falló:",
      error instanceof Error ? error.message : error
    );

    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync("admin-access-failure.png", screenshot, "base64");
    console.log("🖼️ Screenshot guardada en admin-access-failure.png");
  } finally {
    await driver.quit();
  }
})();
