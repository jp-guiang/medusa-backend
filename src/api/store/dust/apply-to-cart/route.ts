import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import applyDustToCartWorkflow from "../../../../workflows/apply-dust-to-cart"
import { Modules } from "@medusajs/framework/utils"

/**
 * POST /store/dust/apply-to-cart
 * Apply dust points to cart as payment
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const customerId = (req as any).auth_context?.actor_id
  const body = req.body as { cart_id?: string; dust_amount?: number }
  const { cart_id, dust_amount } = body

  if (!customerId) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  if (!cart_id || !dust_amount || dust_amount <= 0) {
    return res.status(400).json({
      message: "cart_id and positive dust_amount are required",
    })
  }

  try {
    const { result } = await applyDustToCartWorkflow(req.scope).run({
      input: {
        cart_id,
        customer_id: customerId,
        dust_amount,
      },
    })

    res.json({
      success: true,
      payment_session: result.payment_session,
      available_balance: result.validation.available_balance,
    })
  } catch (error: any) {
    if (error.message?.includes("Insufficient dust balance")) {
      return res.status(400).json({
        message: error.message,
      })
    }
    throw error
  }
}

