import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { DUST_MODULE } from "../modules/dust"
import { Modules } from "@medusajs/framework/utils"

/**
 * Subscriber that handles dust deduction when an order is placed
 * Checks payment sessions for dust payments and deducts accordingly
 */
export default async function orderPlacedDustHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = data.id
  const orderModuleService = container.resolve(Modules.ORDER)
  const paymentModuleService = container.resolve(Modules.PAYMENT)
  const dustService = container.resolve(DUST_MODULE)

  try {
    const order = await orderModuleService.retrieveOrder(orderId)

    const customerId = order.customer_id
    if (!customerId) {
      console.warn(`Order ${orderId} has no customer_id, cannot deduct dust`)
      return
    }

    // Check order metadata or payment collection for dust amount
    // For now, check if order has dust_amount in metadata
    const orderData = order as any
    const dustAmount = orderData.metadata?.dust_amount || orderData.dust_amount

    if (dustAmount && dustAmount > 0) {
      await dustService.debitDust(
        customerId,
        dustAmount,
        "order",
        orderId,
        `Dust spent on order ${orderId}`
      )
    }
  } catch (error) {
    console.error(`Error processing dust deduction for order ${orderId}:`, error)
    // Don't throw - we don't want to fail the order placement
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}

