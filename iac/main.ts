import * as path from "path";
import * as fs from "fs";
import { Construct } from "constructs";
import { App, TerraformStack, TerraformOutput } from "cdktf";

// Coffee Order Combiner code
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

class Order extends Construct {
  constructor(scope: Construct, id: string, config: OrderConfig) {
    super(scope, id);

    new TerraformOutput(this, "OrderItems", {
      value: JSON.stringify(config.items, null, 2),
    });
  }
}

function readJsonFile(filePath: string): CoffeeOrder {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const parsedContent = JSON.parse(fileContent);

  const coffeeId = parsedContent.coffee.id;

  return {
    items: {
      coffee: {
        id: coffeeId,
        ...parsedContent.coffee, // Include additional coffee properties
      },
      quantity: parsedContent.quantity,
      ...parsedContent, // Include additional properties
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
    ...order.items,
  }));

  console.log(JSON.stringify({ items: itemsArray }, null, 2));

  return { items: itemsArray };
}

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Run the Coffee Order Combiner for a specific user (e.g., "yasmeen")
    const ordersFolder = "src/orders";
    const username = "yasmeen";
    const combinedOrders = combineOrdersFromFolders(ordersFolder, username);
    const orderConfig = printCombinedOrders(combinedOrders);

    // Create an Order resource with the user's folder name as ID and the items array as config
    new Order(this, username, orderConfig);
  }
}

const app = new App();
new MyStack(app, "iac");
app.synth();
