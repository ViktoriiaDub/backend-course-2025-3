#!/usr/bin/env node
import { Command } from "commander";
import fs from "fs";

const program = new Command();

program
  .option("-i, --input <path>", "шлях до вхідного файлу JSON (обов’язковий)")
  .option("-o, --output <path>", "шлях до файлу для запису результату")
  .option("-d, --display", "вивести результат у консоль")
  .option("-f, --furnished", "відображати лише будинки з furnishingstatus = 'furnished'")
  .option("-p, --price <number>", "відображати лише будинки з ціною меншою за вказану");

program.parse(process.argv);
const options = program.opts();

// перевіряємо чи є обов'язковий параметр
if (!options.input) {
  console.error("Please, specify input file (-i or --input)");
  process.exit(1);
}

//перевіряємо чи існує файл
if (!fs.existsSync(options.input)) {
  console.error("Cannot find input file");
  process.exit(1);
}

//зчитуємо джисон файл
let data;
try {
  const fileContent = fs.readFileSync(options.input, "utf8");
  data = JSON.parse(fileContent);
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
let filtered = data;

if (options.furnished) {
  filtered = filtered.filter(
    (item) => item.furnishingstatus?.toLowerCase() === "furnished"
  );
}

if (options.price) {
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





