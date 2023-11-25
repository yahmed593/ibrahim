# Coffee Order yacycoffe

## Overview

This code represents a Coffee Order Combiner, which combines individual coffee orders from JSON files into a consolidated order for a specific user. It utilizes the CDK for Terraform to define and deploy infrastructure.

## Functions

### 1. `Order` Class

The `Order` class is a CDK Construct that represents an order. It takes a configuration object with an array of items, each containing information about the coffee (id and name) and the quantity. The class outputs the order items in JSON format.

```typescript
class Order extends Construct {
  constructor(scope: Construct, id: string, config: OrderConfig) {
    super(scope, id);

    new TerraformOutput(this, "OrderItems", {
      value: JSON.stringify(config.items, null, 2),
    });
  }
}
```

### 2. `readJsonFile` Function

The `readJsonFile` function reads a JSON file from the provided file path and returns a structured `CoffeeOrder` object.

```typescript
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
```

### 3. `getJsonFilesInFolder` Function

The `getJsonFilesInFolder` function retrieves an array of JSON files in a specified folder.

```typescript
function getJsonFilesInFolder(folderPath: string): string[] {
  const files = fs.readdirSync(folderPath);
  return files.filter((file) => file.endsWith(".json"));
}
```

### 4. `combineOrdersFromFolders` Function

The `combineOrdersFromFolders` function combines coffee orders for a specific user from JSON files in a given folder.

```typescript
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
```

### 5. `printCombinedOrders` Function

The `printCombinedOrders` function takes an array of `CoffeeOrder` objects, extracts the items, and prints the combined order in JSON format.

```typescript
function printCombinedOrders(orders: CoffeeOrder[]): OrderConfig {
  const itemsArray = orders.map((order) => ({
    ...order.items,
  }));

  console.log(JSON.stringify({ items: itemsArray }, null, 2));

  return { items: itemsArray };
}
```

### 6. `MyStack` Class

The `MyStack` class extends `TerraformStack` and orchestrates the process of combining coffee orders for a specific user and creating a corresponding `Order` resource.

```typescript
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
```

### 7. Application Entry Point

The application's entry point instantiates an `App` and a `MyStack` object, which is then synthesized to generate Terraform configuration.

```typescript
const app = new App();
new MyStack(app, "iac");
app.synth();
```

## Usage

To use this code, follow these steps:

1. Ensure Node.js and npm are installed.
2. Install dependencies: `npm install`
3. Run the application: `npm run build && cdktf deploy`
