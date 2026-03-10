export interface CategoryProps {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export class Category {
  private constructor(
    private readonly _id: string,
    private readonly _name: string,
    private readonly _icon: string,
    private readonly _color: string,
  ) {}

  static restore(props: CategoryProps): Category {
    return new Category(props.id, props.name, props.icon, props.color);
  }

  get id(): string { return this._id; }
  get name(): string { return this._name; }
  get icon(): string { return this._icon; }
  get color(): string { return this._color; }
}
