
import { Command } from "commander";
import fs from "fs";

const program = new Command(); // об'єкт програми для налаштування команд

//вимкнення стандартних повідомлень про помилки
program.configureOutput({
  // вимикаємо stderr (Commander туди друкує помилки)
  writeErr: () => {},
});

//перехоплення помилок від commander
program.exitOverride((err) => { 
  // якщо відсутній обов’язковий параметр
  if (err.code === 'commander.missingMandatoryOptionValue' || err.code === 'commander.optionMissingArgument' || err.code === 'commander.missingRequiredOption') {
    console.error("Please, specify input option");
    process.exit(1);
  }
  throw err; // інші помилки

});

program
  .requiredOption("-i, --input <path>", "шлях до вхідного файлу JSON (обов’язковий)")
  .option("-o, --output <path>", "шлях до файлу для запису результату")
  .option("-d, --display", "вивести результат у консоль")
  .option("-f, --furnished", "відображати лише будинки з furnishingstatus = 'furnished'")
  .option("-p, --price <number>", "відображати лише будинки з ціною меншою за вказану");

try {
  program.parse(process.argv);
} catch {
  process.exit(1);
}

const options = program.opts(); //зберігаємо усі параметри у цю змінну

//перевіряємо чи існує файл
if (!fs.existsSync(options.input)) {
  console.error("Cannot find input file");
  process.exit(1);
}

//зчитуємо джисон файл
let data;//змінна для збереження даних з файлу
try {
  const fileContent = fs.readFileSync(options.input, "utf8");
  data = JSON.parse(fileContent);//перетворення тексту у масив
} catch (err) {
  console.error("Error reading or parsing JSON file:", err.message);
  process.exit(1);
}

//перевіряємо що джисон є масивом
if (!Array.isArray(data)) {
  console.error("Input JSON must contain an array of houses");
  process.exit(1);
}

// фільтруємо з параметрами
let filtered = data; //масив без фільтрів

if (options.furnished) { //параметр для f
  filtered = filtered.filter(
    (item) => item.furnishingstatus?.toLowerCase() === "furnished"
  );
}

if (options.price) {//параметр p
  const maxPrice = parseFloat(options.price);
  if (!isNaN(maxPrice)) {
    filtered = filtered.filter((item) => Number(item.price) < maxPrice);
  }
}

// формуємо рядки
const resultLines = filtered.map((item) => {
  const price = item.price ?? "unknown";
  const area = item.area ?? "unknown";
  return `${price} ${area}`;
});

const resultText = resultLines.join("\n");

//якщо не задано ні output ні display то завершуємо
if (!options.output && !options.display) {
  process.exit(0);
}

//виводимо результат
if (options.display) {
  console.log(resultText);
}

//записуємо у файл
if (options.output) {
  fs.writeFileSync(options.output, resultText, "utf8");
}
