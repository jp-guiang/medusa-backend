import {
  createStep,
  createWorkflow,
  WorkflowResponse,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { DUST_MODULE } from "../modules/dust"

type DebitDustInput = {
  customer_id: string
  amount: number
  reference_type?: string
  reference_id?: string
  description?: string
}

const debitDustStep = createStep(
  "debit-dust-step",
  async (
    input: DebitDustInput,
    { container }
  ) => {
    const dustService = container.resolve(DUST_MODULE)

    const balance = await dustService.debitDust(
      input.customer_id,
      input.amount,
      input.reference_type,
      input.reference_id,
      input.description
    )

    return new StepResponse(balance)
  }
)

const debitDustWorkflow = createWorkflow(
  "debit-dust",
  (input: DebitDustInput) => {
    const balance = debitDustStep(input)

    return new WorkflowResponse(balance)
  }
)

export default debitDustWorkflow

