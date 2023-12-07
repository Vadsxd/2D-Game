import {Entity} from "./Entity.js";

export class Door extends Entity {
    name = "Door";

    constructor(id, physicManager, soundManager) {
        super(id, physicManager, soundManager);
    }

    draw(spriteManager, ctx) {
        spriteManager.drawSprite(ctx, "door", this.pos_x, this.pos_y);
    }

    update() {

    }

    kill() {
        this.physicManager.gameManager.score += 50;
        this.physicManager.gameManager.kill(this);
    }
}