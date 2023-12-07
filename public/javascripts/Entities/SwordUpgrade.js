import {Entity} from "./Entity.js";

export class SwordUpgrade extends Entity {
    name = "SwordUpgrade";
    sprite_speed = 3;
    curr_sprite = 0;
    num_sprite = 4;
    value = true;

    constructor(id, physicManager, soundManager) {
        super(id, physicManager, soundManager);
    }

    draw(spriteManager, ctx) {
        ctx.save();
        ctx.translate(this.pos_x, this.pos_y);

        spriteManager.drawSprite(ctx, "sup_" + this.curr_sprite, 0, 0);
        ctx.restore();
    }

    update() {
        if (--this.sprite_speed > 0) {
            return;
        }

        this.curr_sprite++;
        if(this.curr_sprite >= this.num_sprite){
            this.curr_sprite = 0;
        }
        this.sprite_speed = 3;
    }

    kill() {
        this.physicManager.gameManager.score += 300;
        this.physicManager.gameManager.kill(this);
    }
}