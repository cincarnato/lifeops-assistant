
interface IInstructionBase {
    tenant?: any
    title: string
    content: string
    createdAt?: Date
    updatedAt?: Date
}

interface IInstruction {
    tenant?: any
    _id: string
    title: string
    content: string
    createdAt?: Date
    updatedAt?: Date
}

export type {
IInstructionBase,
IInstruction
}
