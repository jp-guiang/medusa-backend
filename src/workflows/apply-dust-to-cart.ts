import {
  createStep,
  createWorkflow,
  WorkflowResponse,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { DUST_MODULE } from "../modules/dust"
import { Modules } from "@medusajs/framework/utils"

type ApplyDustToCartInput = {
  cart_id: string
  customer_id: string
  dust_amount: number
}

/**
 * Step to validate dust balance before applying to cart
 */
const validateDustBalanceStep = createStep(
  "validate-dust-balance",
  async (
    input: { customer_id: string; dust_amount: number },
    { container }
  ) => {
    const dustService = container.resolve(DUST_MODULE)
    const balance = await dustService.getBalance(input.customer_id)

    if (balance.balance < input.dust_amount) {
      throw new Error(
        `Insufficient dust balance. Available: ${balance.balance}, Required: ${input.dust_amount}`
      )
    }

    return new StepResponse({
      available_balance: balance.balance,
      requested_amount: input.dust_amount,
    })
  }
)

/**
 * Step to apply dust as payment to cart
 * This creates a payment session for dust
 */
const applyDustPaymentStep = createStep(
  "apply-dust-payment",
  async (
    input: ApplyDustToCartInput,
    { container }
  ) => {
    const paymentModuleService = container.resolve(Modules.PAYMENT)
    
    // Create a payment session for dust
    // The actual payment will be processed when order is placed
    // Note: Payment session creation would need to be implemented
    // For now, return the dust amount to be used in checkout
    const paymentSession = {
      id: `dust_${input.cart_id}`,
      provider_id: "dust_payment_provider",
      amount: input.dust_amount,
      currency_code: "usd",
      data: {
        dust_amount: input.dust_amount,
        customer_id: input.customer_id,
      },
    }

    return new StepResponse(paymentSession)
  }
)

/**
 * Workflow to apply dust points to cart
 * This validates balance and creates a payment session
 */
const applyDustToCartWorkflow = createWorkflow(
  "apply-dust-to-cart",
  (input: ApplyDustToCartInput) => {
    // Validate dust balance
    const validation = validateDustBalanceStep({
      customer_id: input.customer_id,
      dust_amount: input.dust_amount,
    })

    // Apply dust as payment
    const paymentSession = applyDustPaymentStep(input)

    return new WorkflowResponse({
      payment_session: paymentSession,
      validation,
    })
  }
)

export default applyDustToCartWorkflow

