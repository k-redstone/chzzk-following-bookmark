export interface IChzzkResponse<T> {
  code: number
  content: T | null
  message: string | null
}

export interface IMessage {
  type: string
  args: unknown[]
}
