import { Node, Edge } from "@xyflow/react"

export interface FlowExecutionStep {
    nodeId: string
    status: 'idle' | 'loading' | 'success' | 'error'
    output?: string
}

export interface FlowResult {
    success: boolean
    output: string
    steps: FlowExecutionStep[]
}

export const executeFlow = async (
    nodes: Node[],
    edges: Edge[],
    userInput: string
): Promise<FlowResult> => {
    // Traverse graph to prepare execution
    // PROD-LEVEL: In a real system, we'd handle branching, loops, etc.
    // For now, we prepare the data for the backend orchestration.

    try {
        const response = await fetch(`${(import.meta as any).env.VITE_API_URL}/api/agent-flow/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                nodes,
                edges,
                userInput,
                apiKey: localStorage.getItem('gemini_api_key') // Inject User Key
            })
        })

        if (!response.ok) {
            throw new Error('Flow execution failed on server')
        }

        return await response.json()
    } catch (error: any) {
        console.error("Flow Runner Error:", error)
        return {
            success: false,
            output: "System failure. Visual flow logic corrupted.",
            steps: []
        }
    }
}
