import type { System } from './System';
import type { Entity } from './Entity';
import { Component, ComponentContainer, ComponentClass } from './Component';

export class ECS {
  private entities = new Map<Entity, ComponentContainer>();
  private systems = new Map<System, Set<Entity>>();

  private nextEntityId = 0;
  private entitiesToDestroy: Entity[] = [];

  public addEntity(): Entity {
    const entity = this.nextEntityId++;
    this.entities.set(entity, new ComponentContainer());
    return entity;
  }

  public removeEntity(entity: Entity): void {
    this.entitiesToDestroy.push(entity);
  }

  public addComponent(entity: Entity, component: Component): void {
    if (!this.entities.has(entity)) throw new Error('Entity does not exist');
    this.entities.get(entity)!.add(component);
    this.checkSystemRequirements(entity);
  }

  public getComponents(entity: Entity): ComponentContainer {
    if (!this.entities.has(entity)) throw new Error('Entity does not exist');
    return this.entities.get(entity)!;
  }

  public removeComponent(
    entity: Entity,
    componentClass: ComponentClass<Component>
  ): void {
    if (!this.entities.has(entity)) throw new Error('Entity does not exist');
    this.entities.get(entity)!.delete(componentClass);
    this.checkSystemRequirements(entity);
  }

  public addSystem(system: System): void {
    if (system.componentsRequired.size === 0) {
      throw new Error('System requires at least one component');
    }
    system.ecs = this;

    this.systems.set(system, new Set());

    for (const [entity] of this.entities) {
      this.checkEntityInSystem(entity, system);
    }
  }

  public removeSystem(system: System): void {
    this.systems.delete(system);
  }

  public update(): void {
    for (const [system, entities] of this.systems) {
      system.update(entities);
    }

    for (const entity of this.entitiesToDestroy) {
      this.destroyEntity(entity);
    }
    this.entitiesToDestroy.length = 0;
  }

  private destroyEntity(entity: Entity): void {
    this.entities.delete(entity);
    for (const [, entities] of this.systems) {
      entities.delete(entity);
    }
  }

  private checkSystemRequirements(entity: Entity): void {
    for (const [system] of this.systems) {
      this.checkEntityInSystem(entity, system);
    }
  }

  private checkEntityInSystem(entity: Entity, system: System) {
    const have = this.entities.get(entity);
    const need = system.componentsRequired;
    if (have?.hasAll(need)) {
      this.systems.get(system)!.add(entity);
    } else {
      this.systems.get(system)!.delete(entity);
    }
  }
}
