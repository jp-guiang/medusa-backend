import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";
import {
  updateStoresStep,
} from "@medusajs/medusa/core-flows";
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";

const updateStoreCurrencies = createWorkflow(
  "update-store-currencies",
  (input: {
    supported_currencies: { currency_code: string; is_default?: boolean }[];
    store_id: string;
  }) => {
    const normalizedInput = transform({ input }, (data) => {
      return {
        selector: { id: data.input.store_id },
        update: {
          supported_currencies: data.input.supported_currencies.map(
            (currency) => {
              return {
                currency_code: currency.currency_code,
                is_default: currency.is_default ?? false,
              };
            }
          ),
        },
      };
    });

    const stores = updateStoresStep(normalizedInput);

    return new WorkflowResponse(stores);
  }
);

export default async function addDustCurrency({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const storeModuleService = container.resolve(Modules.STORE);

  logger.info("Adding dust currency to store...");
  
  const [store] = await storeModuleService.listStores();
  
  if (!store) {
    throw new Error("No store found");
  }

  // Get existing supported currencies
  const existingCurrencies = store.supported_currencies || [];
  
  // Check if dust (XAG) is already added
  const dustCurrency = existingCurrencies.find(
    (c: any) => c.currency_code === "xag"
  );

  if (dustCurrency) {
    logger.info("Dust currency (XAG) is already added to the store");
    return;
  }

  // Add XAG (Silver Ounce) as "dust" currency
  // XAG is a commonly unused ISO currency code that we can repurpose
  const updatedCurrencies = [
    ...existingCurrencies,
    {
      currency_code: "xag", // Using XAG (Silver Ounce) as the code for "dust"
      is_default: false,
    },
  ];

  await updateStoreCurrencies(container).run({
    input: {
      store_id: store.id,
      supported_currencies: updatedCurrencies,
    },
  });

  logger.info("Successfully added dust currency (XAG) to the store");
  logger.info("You can now use 'xag' as the currency_code for dust in your products and regions");
}

