import { FunctionHandler } from '@iote/cqrs';
import { AddNoteToBudgetCommand } from './add-note.command';

/**
 * Generic command handler interface (keeps CQRS contract clear)
 */
export interface ICommandHandler<TCommand> {
  execute(command: TCommand, payload?: any): Promise<any>;
}

/**
 * Result interface for add-note handler
 */
export interface AddNoteToBudgetResult {
  success: boolean;
  error?: string;
}

export class AddNoteToBudgetHandler
  extends FunctionHandler<AddNoteToBudgetCommand, AddNoteToBudgetResult>
  implements ICommandHandler<AddNoteToBudgetCommand>
{
  public async execute(
    command: AddNoteToBudgetCommand,
    payload?: any
  ): Promise<AddNoteToBudgetResult> {
    // Basic validation
    if (!command.content || command.content.trim() === '') {
      return { success: false, error: 'Note content cannot be empty.' };
    }

    if (!command.budgetId) {
      return { success: false, error: 'Budget ID is required.' };
    }

    // Retrieve repository helper from payload (FunctionHandler runtime provides this)
    const repo = payload?.getRepository ? payload.getRepository('budget-notes') : null;

    if (!repo) {
      return { success: false, error: 'Repository unavailable.' };
    }

    // addNote expected to be implemented by the repository adapter
    await repo.addNote({
      budgetId: command.budgetId,
      content: command.content,
      authorId: command.authorId,
      createdAt: command.createdAt,
    });

    return { success: true };
  }
}
