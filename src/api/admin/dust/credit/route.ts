import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import creditDustWorkflow from "../../../../workflows/credit-dust"

/**
 * POST /admin/dust/credit
 * Credit dust to a customer (admin only)
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const body = req.body as { customer_id?: string; amount?: number; description?: string }
  const { customer_id, amount, description } = body

  if (!customer_id || !amount || amount <= 0) {
    return res.status(400).json({
      message: "customer_id and positive amount are required",
    })
  }

  const { result } = await creditDustWorkflow(req.scope).run({
    input: {
      customer_id,
      amount,
      reference_type: "admin_adjustment",
      description: description || `Admin credit: ${amount} dust`,
    },
  })

  res.json({
    success: true,
    balance: result.balance,
  })
}

