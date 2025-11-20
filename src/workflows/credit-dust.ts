import {
  createStep,
  createWorkflow,
  WorkflowResponse,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { DUST_MODULE } from "../modules/dust"

type CreditDustInput = {
  customer_id: string
  amount: number
  reference_type?: string
  reference_id?: string
  description?: string
}

const creditDustStep = createStep(
  "credit-dust-step",
  async (
    input: CreditDustInput,
    { container }
  ) => {
    const dustService = container.resolve(DUST_MODULE)

    const balance = await dustService.creditDust(
      input.customer_id,
      input.amount,
      input.reference_type,
      input.reference_id,
      input.description
    )

    return new StepResponse(balance)
  }
)

const creditDustWorkflow = createWorkflow(
  "credit-dust",
  (input: CreditDustInput) => {
    const balance = creditDustStep(input)

    return new WorkflowResponse(balance)
  }
)

export default creditDustWorkflow

