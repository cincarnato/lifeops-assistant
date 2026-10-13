
interface IInstructionBase {
    title: string
    description?: string
    content: string
    createdAt?: Date
    updatedAt?: Date
}

interface IInstruction {
    _id: string
    title: string
    description?: string
    content: string
    createdAt?: Date
    updatedAt?: Date
}

export type {
IInstructionBase,
IInstruction
}
