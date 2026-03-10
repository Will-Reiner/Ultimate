import { InvalidCategoryLimitError } from '../errors/FinanceErrors';

export interface CategoryLimitProps {
  categoryId: string;
  limit: number;
}

export class CategoryLimit {
  private constructor(
    private readonly _categoryId: string,
    private readonly _limit: number,
  ) {}

  static create(props: CategoryLimitProps): CategoryLimit {
    if (props.limit <= 0) {
      throw new InvalidCategoryLimitError('limite deve ser maior que zero.');
    }

    return new CategoryLimit(props.categoryId, props.limit);
  }

  static restore(props: CategoryLimitProps): CategoryLimit {
    return new CategoryLimit(props.categoryId, props.limit);
  }

  get categoryId(): string {
    return this._categoryId;
  }

  get limit(): number {
    return this._limit;
  }

  toJSON(): CategoryLimitProps {
    return {
      categoryId: this._categoryId,
      limit: this._limit,
    };
  }
}
