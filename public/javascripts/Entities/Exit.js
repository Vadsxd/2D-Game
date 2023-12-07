import {Entity} from "./Entity.js";

export class Exit extends Entity {
    name = "Exit";

    constructor(id, physicManager, soundManager) {
        super(id, physicManager, soundManager);
    }

    draw(spriteManager, ctx) {
        spriteManager.drawSprite(ctx, "exit", this.pos_x, this.pos_y);
    }

    update() {

    }
}