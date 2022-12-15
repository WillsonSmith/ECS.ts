```ts
import { ECS, Component, System } from './engine/ecs';
import type { Entity } from './engine/ecs';

class Zombie extends Component {
  health: number = 100;
  constructor(public x: number = 0, public y: number = 0) {
    super();
  }
}

class Render extends System {
  public componentsRequired = new Set<Function>([Zombie]);

  public update(entities: Set<Entity>): void {
    for (const entity of entities) {
      const zombie = this.ecs.getComponents(entity).get(Zombie);
      zombie.x = zombie.x + 1;
      zombie.y = zombie.y + 1;
      console.log(zombie.x, zombie.y);
    }
  }
}

const ecs = new ECS();

const zombieEntity = ecs.addEntity();
ecs.addComponent(zombieEntity, new Zombie(10, 10));

ecs.addSystem(new Render());

ecs.update();
setInterval(() => {
  ecs.update();
}, 1000);
// 11 11
// 12 12
// 13 13
// ...
```
