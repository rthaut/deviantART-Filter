const fs = require("fs");
const path = require("path");
const { Resvg } = require("@resvg/resvg-js");

const sizes = [16, 19, 24, 32, 38, 48, 64, 96, 128];
const inputFile = path.resolve("images/logo/logo-orange.svg");
const outputDir = path.resolve("public/images/");

// the logo is wider than it is tall, so center it vertically in a square
// viewBox to get square icons
const svg = fs.readFileSync(inputFile, "utf8");
const [x, y, width, height] = svg
  .match(/viewBox="([^"]+)"/)[1]
  .trim()
  .split(/[\s,]+/)
  .map(Number);
const side = Math.max(width, height);
const squareViewBox = [
  x - (side - width) / 2,
  y - (side - height) / 2,
  side,
  side,
].join(" ");
const input = svg.replace(/viewBox="[^"]+"/, `viewBox="${squareViewBox}"`);

sizes.forEach((size) => {
  const resvg = new Resvg(input, { fitTo: { mode: "width", value: size } });
  const output = resvg.render().asPng();

  const outputFilename = "icon-" + size.toString() + ".png";
  fs.writeFileSync(path.join(outputDir, outputFilename), output, {
    flag: "w",
  });
  console.log("Created", outputFilename, "in", outputDir);
});
