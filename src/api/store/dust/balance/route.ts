import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DUST_MODULE } from "../../../../modules/dust"

/**
 * GET /store/dust/balance
 * Get the current dust balance for the authenticated customer
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const customerId = (req as any).auth_context?.actor_id

  if (!customerId) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  const dustService = req.scope.resolve(DUST_MODULE)
  const balance = await dustService.getBalance(customerId)

  res.json({
    balance: balance.balance,
    customer_id: balance.customer_id,
  })
}

