import type { ECS } from './ECS';
import type { Entity } from './Entity';
export abstract class System {
  public abstract componentsRequired: Set<Function>;
  public abstract update(entitles: Set<Entity>): void;
  public ecs: ECS;
}
