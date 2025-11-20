import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DUST_MODULE } from "../../../../modules/dust"

/**
 * GET /store/dust/transactions
 * Get transaction history for the authenticated customer
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
  const transactions = await dustService.getTransactionHistory(customerId, {
    take: req.query.take ? parseInt(req.query.take as string) : 50,
    skip: req.query.skip ? parseInt(req.query.skip as string) : 0,
  })

  res.json({ transactions })
}

