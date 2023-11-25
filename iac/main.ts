import * as path from "path";
import * as fs from "fs";
import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { provider } from "@cdktf/provider-hashicups";
import { order } from "@cdktf/provider-hashicups";

interface CoffeeOrder {
  items: {
    coffee: {
      id: number;
      name?: String;
    };
    quantity: number;
  };
}

interface OrderConfig {
  items: {
    coffee: {
      id: number;
      name?: String;
    };
    quantity: number;
  }[];
}

function getSubfoldersInFolder(folderPath: string): string[] {
  const subfolders = fs.readdirSync(folderPath);
  return subfolders.filter((subfolder) =>
    fs.statSync(path.join(folderPath, subfolder)).isDirectory()
  );
}

function readJsonFile(filePath: string): CoffeeOrder {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const parsedContent = JSON.parse(fileContent);

  const coffeeId = parsedContent.coffee.id;

  return {
    items: {
      coffee: {
        id: coffeeId,
        name: parsedContent.name,
      },
      quantity: parsedContent.quantity,
    },
  };
}

function getJsonFilesInFolder(folderPath: string): string[] {
  const files = fs.readdirSync(folderPath);
  return files.filter((file) => file.endsWith(".json"));
}

function combineOrdersFromFolders(
  ordersFolder: string,
  username: string
): CoffeeOrder[] {
  const folderPath = path.join(ordersFolder, username);
  const jsonFiles = getJsonFilesInFolder(folderPath);
  const orderFiles = jsonFiles.map((file) => path.join(folderPath, file));
  const orders = orderFiles.map((filePath) => readJsonFile(filePath));
  return orders;
}

function printCombinedOrders(orders: CoffeeOrder[]): OrderConfig {
  const itemsArray = orders.map((order) => ({
    coffee: {
      id: order.items.coffee.id,
    },
    quantity: order.items.quantity,
  }));

  console.log(JSON.stringify({ items: itemsArray }, null, 2));

  return { items: itemsArray };
}

export class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new provider.HashicupsProvider(this, "yacycoffe");

    // Run the Coffee Order Combiner for a specific user (e.g., "yasmeen")
    const ordersFolder = "src/orders";
    const folderNamesList = getSubfoldersInFolder(ordersFolder);

    for (let i = 0; i < folderNamesList.length; i++) {
      const username = folderNamesList[i];
      const combinedOrders = combineOrdersFromFolders(ordersFolder, username);
      const orderConfig = printCombinedOrders(combinedOrders);

      new order.Order(this, username, orderConfig);
    }
  }
}

const app = new App();
new MyStack(app, "iac");
app.synth();
