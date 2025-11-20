import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DUST_MODULE } from "../../../../../modules/dust"

/**
 * GET /admin/dust/balance/:customer_id
 * Get dust balance for a specific customer (admin only)
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { customer_id } = req.params

  const dustService = req.scope.resolve(DUST_MODULE)
  const balance = await dustService.getBalance(customer_id)

  res.json({
    balance: balance.balance,
    customer_id: balance.customer_id,
  })
}

