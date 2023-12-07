import {Entity} from "./Entity.js";
import {FlameBullet} from "./FlameBullet.js";

export class FlameTrap extends Entity {
    name = "FlameTrap";
    damage = 40;
    attackDelay = 15;
    currentDelay = 0;

    constructor(id, physicManager, soundManager) {
        super(id, physicManager, soundManager);
    }

    draw(spriteManager, ctx) {
        spriteManager.drawSprite(ctx, "flame_trap", this.pos_x, this.pos_y);
    }

    update() {
        this.attack();
        this.physicManager.update(this);
    }

    onTouchEntity(obj) {
    }

    attack() {
        if (!(this.currentDelay === 0)) {
            if (this.currentDelay !== 0) {
                this.currentDelay -= 1
            }
            return;
        }

        let s = new FlameBullet(this.physicManager.gameManager.genIdObj(), this.physicManager, this.soundManager);
        s.damage = this.damage;
        s.move_x = 0;
        s.move_y = 1;

        s.pos_x = this.pos_x;
        s.pos_y = this.pos_y + s.size_y + Math.floor(this.size_y / 2);

        this.currentDelay = this.attackDelay;
        this.physicManager.gameManager.entities.push(s);
    }
}