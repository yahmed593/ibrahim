import * as path from "path";
import * as fs from "fs";
import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { order } from "@cdktf/provider-hashicups";

// Coffee Order Combiner code

interface CoffeeOrder {
  items: {
    coffee: {
      id: number;
      name?: string;
    };
    quantity: number;
  };
}

interface OrderConfig {
  items: {
    coffee: {
      id: number;
      name?: string;
    };
    quantity: number;
  }[];
}

function readJsonFile(filePath: string): CoffeeOrder {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const parsedContent = JSON.parse(fileContent);

  const coffeeId = parsedContent.coffee.id;

  return {
    items: {
      coffee: {
        id: coffeeId,
        ...parsedContent.coffee,
      },
      quantity: parsedContent.quantity,
      ...parsedContent,
    },
  };
}

function getJsonFilesInFolder(folderPath: string): string[] {
  const files = fs.readdirSync(folderPath);
  return files.filter((file) => file.endsWith(".json"));
}

function combineOrdersFromFolders(ordersFolder: string): CoffeeOrder[] {
  const allOrders: CoffeeOrder[] = [];

  const folders = fs.readdirSync(ordersFolder);

  for (const folder of folders) {
    const folderPath = path.join(ordersFolder, folder);

    if (fs.statSync(folderPath).isDirectory()) {
      const orderFiles = getJsonFilesInFolder(folderPath);
      const orders = orderFiles.map((file) => readJsonFile(path.join(folderPath, file)));
      allOrders.push(...orders);
    }
  }

  return allOrders;
}function getSubfoldersInFolder(folderPath: string): string[] {
  const subfolders = fs.readdirSync(folderPath);
  return subfolders.filter((subfolder) =>
    fs.statSync(path.join(folderPath, subfolder)).isDirectory()
  );
}

function printCombinedOrders(orders: CoffeeOrder[], fileNames: string[]): OrderConfig[] {
  const orderConfigs: OrderConfig[] = [];

  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    const fileName = fileNames[i];
    const itemsArray = [order.items];

    console.log(`File: ${fileName}`);
    console.log(JSON.stringify({ items: itemsArray }, null, 2));

    orderConfigs.push({ items: itemsArray });
  }

  return orderConfigs;
}

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const ordersFolder = "src/orders";
    const folderNames = getSubfoldersInFolder(ordersFolder);
    const combinedOrders = combineOrdersFromFolders(ordersFolder);
    const orderConfigs = printCombinedOrders(combinedOrders, folderNames);

    for (let i = 0; i < folderNames.length; i++) {
      const folderName = path.basename(path.dirname(folderNames[i])); 
      new order.Order(this, folderName, orderConfigs[i]);
    }
  }
}


const app = new App();
new MyStack(app, "iac");
app.synth();
