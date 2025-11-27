export class AddNoteToBudgetCommand {
  constructor(
    public readonly budgetId: string,
    public readonly content: string,
    public readonly authorId: string,
    public readonly createdAt: Date = new Date()
  ) {}
}
