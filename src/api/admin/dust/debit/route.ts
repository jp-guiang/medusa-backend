import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import debitDustWorkflow from "../../../../workflows/debit-dust"

/**
 * POST /admin/dust/debit
 * Debit dust from a customer (admin only)
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

  try {
    const { result } = await debitDustWorkflow(req.scope).run({
      input: {
        customer_id,
        amount,
        reference_type: "admin_adjustment",
        description: description || `Admin debit: ${amount} dust`,
      },
    })

    res.json({
      success: true,
      balance: result.balance,
    })
  } catch (error: any) {
    if (error.message === "Insufficient dust balance") {
      return res.status(400).json({
        message: "Insufficient dust balance",
      })
    }
    throw error
  }
}

